package chainlistener

import (
	"bytes"
	"consentis-api/internal/models"
	"consentis-api/internal/repositories"
	"context"
	"fmt"
	"log"
	"os"
	"sync"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

const defaultABIPath = "contracts/ConsentRegistry.abi"
const consentGranted = "ConsentGranted"
const consentRevoked = "ConsentRevoked"

func startWebSocketConnection(ctx context.Context) *ethclient.Client {
	ethClientAddress, err := getEthClientAddress()
	wsClient, err := ethclient.DialContext(ctx, ethClientAddress)
	if err != nil {
		log.Fatal("websocket dial:", err)
	}
	return wsClient
}

func StartEventListener(ctx context.Context) {
	fmt.Println("starting listener...")

	contractAddress, err := getContractAddress()
	if err != nil {
		log.Fatal(err)
	}

	contractAddr := common.HexToAddress(contractAddress)
	wsClient := startWebSocketConnection(ctx)
	defer wsClient.Close()

	abiBytes, err := os.ReadFile(defaultABIPath)
	if err != nil {
		log.Fatal("read abi:", err)
	}

	parsedABI, err := abi.JSON(bytes.NewReader(abiBytes))
	if err != nil {
		log.Fatal("parse abi:", err)
	}

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		listenToEventCreation(contractAddr, parsedABI, ctx, wsClient, consentGranted)
	}()

	go func() {
		defer wg.Done()
		listenToEventCreation(contractAddr, parsedABI, ctx, wsClient, consentRevoked)
	}()

	<-ctx.Done()
	log.Println("Context cancelled, waiting for listeners to finish...")

	wg.Wait()
}

func listenToEventCreation(contractAddr common.Address, parsedABI abi.ABI, ctx context.Context, wsClient *ethclient.Client, eventName string) {
	events, ok := parsedABI.Events[eventName]
	if !ok {
		log.Fatalf("event %v not found in ABI", eventName)
	}
	topic0 := events.ID

	ch := make(chan types.Log)
	sub, err := wsClient.SubscribeFilterLogs(ctx, ethereum.FilterQuery{
		Addresses: []common.Address{contractAddr},
		Topics:    [][]common.Hash{{topic0}},
	}, ch)
	if err != nil {
		log.Fatal("subscribe:", err)
	}

	for {
		select {
		case <-ctx.Done():
			log.Println("shutting down listener")
			return

		case err := <-sub.Err():
			log.Println("subscription error:", err)
			return

		case lg := <-ch:
			SaveConsent(parsedABI, lg, eventName)
		}
	}
}

func SaveConsent(parsedABI abi.ABI, lg types.Log, eventName string) {
	patient := common.BytesToAddress(lg.Topics[1].Bytes())
	researcher := common.BytesToAddress(lg.Topics[2].Bytes())

	var out struct {
		RecordId string
	}

	if err := parsedABI.UnpackIntoInterface(&out, eventName, lg.Data); err != nil {
		log.Printf("unpack error: %v", err)
		log.Printf("Event data (hex): %x", lg.Data)
		return
	}

	status := "pending"
	switch eventName {
	case consentGranted:
		status = "granted"
	case consentRevoked:
		status = "revoked"
	}
	consent := models.Consent{
		PatientAddress:    patient.String(),
		ResearcherAddress: researcher.String(),
		RecordID:          out.RecordId,
		Status:            status,
	}

	err := repositories.SaveConsent(consent, lg.TxHash.Hex())
	if err != nil {
		log.Println(err)
		return
	}

	log.Printf("Consent %s patient=%s researcher=%s recordId=%s txHash=%s block=%d\n",
		status,
		patient.String(),
		researcher.Hex(),
		out.RecordId,
		lg.TxHash.Hex(),
		lg.BlockNumber,
	)

	err = repositories.SaveUser(researcher.String(), "researcher")
	if err != nil {
		log.Println(err)
		return
	}
}

func getContractAddress() (string, error) {
	contractAddress := os.Getenv("CONTRACT_ADDRESS")
	if contractAddress == "" {
		log.Printf("CONTRACT_ADDRESS environment variable not set")
		return "", fmt.Errorf("CONTRACT_ADDRESS not found")
	}
	return contractAddress, nil
}

func getEthClientAddress() (string, error) {
	ethClientAddress := os.Getenv("ETH_CLIENT_ADDRESS")
	if ethClientAddress == "" {
		log.Printf("ETH_CLIENT_ADDRESS environment variable not set")
		return "", fmt.Errorf("ETH_CLIENT_ADDRESS not found")
	}
	return ethClientAddress, nil
}
