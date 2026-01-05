// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package consentRegistry

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
	_ = abi.ConvertType
)

// ConsentRegistryMetaData contains all meta data concerning the ConsentRegistry contract.
var ConsentRegistryMetaData = &bind.MetaData{
	ABI: "[{\"type\":\"function\",\"name\":\"checkAccess\",\"inputs\":[{\"name\":\"patient\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"researcher\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"recordId\",\"type\":\"string\",\"internalType\":\"string\"}],\"outputs\":[{\"name\":\"\",\"type\":\"bool\",\"internalType\":\"bool\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"grantConsent\",\"inputs\":[{\"name\":\"researcher\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"recordId\",\"type\":\"string\",\"internalType\":\"string\"}],\"outputs\":[],\"stateMutability\":\"nonpayable\"},{\"type\":\"function\",\"name\":\"hasConsent\",\"inputs\":[{\"name\":\"patient\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"researcher\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"recordId\",\"type\":\"string\",\"internalType\":\"string\"}],\"outputs\":[{\"name\":\"\",\"type\":\"bool\",\"internalType\":\"bool\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"revokeConsent\",\"inputs\":[{\"name\":\"researcher\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"recordId\",\"type\":\"string\",\"internalType\":\"string\"}],\"outputs\":[],\"stateMutability\":\"nonpayable\"},{\"type\":\"event\",\"name\":\"ConsentGranted\",\"inputs\":[{\"name\":\"patient\",\"type\":\"address\",\"indexed\":true,\"internalType\":\"address\"},{\"name\":\"researcher\",\"type\":\"address\",\"indexed\":true,\"internalType\":\"address\"},{\"name\":\"recordId\",\"type\":\"string\",\"indexed\":false,\"internalType\":\"string\"}],\"anonymous\":false},{\"type\":\"event\",\"name\":\"ConsentRevoked\",\"inputs\":[{\"name\":\"patient\",\"type\":\"address\",\"indexed\":true,\"internalType\":\"address\"},{\"name\":\"researcher\",\"type\":\"address\",\"indexed\":true,\"internalType\":\"address\"},{\"name\":\"recordId\",\"type\":\"string\",\"indexed\":false,\"internalType\":\"string\"}],\"anonymous\":false}]",
}

// ConsentRegistryABI is the input ABI used to generate the binding from.
// Deprecated: Use ConsentRegistryMetaData.ABI instead.
var ConsentRegistryABI = ConsentRegistryMetaData.ABI

// ConsentRegistry is an auto generated Go binding around an Ethereum contract.
type ConsentRegistry struct {
	ConsentRegistryCaller     // Read-only binding to the contract
	ConsentRegistryTransactor // Write-only binding to the contract
	ConsentRegistryFilterer   // Log filterer for contract events
}

// ConsentRegistryCaller is an auto generated read-only Go binding around an Ethereum contract.
type ConsentRegistryCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ConsentRegistryTransactor is an auto generated write-only Go binding around an Ethereum contract.
type ConsentRegistryTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ConsentRegistryFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type ConsentRegistryFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ConsentRegistrySession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type ConsentRegistrySession struct {
	Contract     *ConsentRegistry  // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// ConsentRegistryCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type ConsentRegistryCallerSession struct {
	Contract *ConsentRegistryCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts          // Call options to use throughout this session
}

// ConsentRegistryTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type ConsentRegistryTransactorSession struct {
	Contract     *ConsentRegistryTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts          // Transaction auth options to use throughout this session
}

// ConsentRegistryRaw is an auto generated low-level Go binding around an Ethereum contract.
type ConsentRegistryRaw struct {
	Contract *ConsentRegistry // Generic contract binding to access the raw methods on
}

// ConsentRegistryCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type ConsentRegistryCallerRaw struct {
	Contract *ConsentRegistryCaller // Generic read-only contract binding to access the raw methods on
}

// ConsentRegistryTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type ConsentRegistryTransactorRaw struct {
	Contract *ConsentRegistryTransactor // Generic write-only contract binding to access the raw methods on
}

// NewConsentRegistry creates a new instance of ConsentRegistry, bound to a specific deployed contract.
func NewConsentRegistry(address common.Address, backend bind.ContractBackend) (*ConsentRegistry, error) {
	contract, err := bindConsentRegistry(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &ConsentRegistry{ConsentRegistryCaller: ConsentRegistryCaller{contract: contract}, ConsentRegistryTransactor: ConsentRegistryTransactor{contract: contract}, ConsentRegistryFilterer: ConsentRegistryFilterer{contract: contract}}, nil
}

// NewConsentRegistryCaller creates a new read-only instance of ConsentRegistry, bound to a specific deployed contract.
func NewConsentRegistryCaller(address common.Address, caller bind.ContractCaller) (*ConsentRegistryCaller, error) {
	contract, err := bindConsentRegistry(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &ConsentRegistryCaller{contract: contract}, nil
}

// NewConsentRegistryTransactor creates a new write-only instance of ConsentRegistry, bound to a specific deployed contract.
func NewConsentRegistryTransactor(address common.Address, transactor bind.ContractTransactor) (*ConsentRegistryTransactor, error) {
	contract, err := bindConsentRegistry(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &ConsentRegistryTransactor{contract: contract}, nil
}

// NewConsentRegistryFilterer creates a new log filterer instance of ConsentRegistry, bound to a specific deployed contract.
func NewConsentRegistryFilterer(address common.Address, filterer bind.ContractFilterer) (*ConsentRegistryFilterer, error) {
	contract, err := bindConsentRegistry(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &ConsentRegistryFilterer{contract: contract}, nil
}

// bindConsentRegistry binds a generic wrapper to an already deployed contract.
func bindConsentRegistry(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := ConsentRegistryMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_ConsentRegistry *ConsentRegistryRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _ConsentRegistry.Contract.ConsentRegistryCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_ConsentRegistry *ConsentRegistryRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _ConsentRegistry.Contract.ConsentRegistryTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_ConsentRegistry *ConsentRegistryRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _ConsentRegistry.Contract.ConsentRegistryTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_ConsentRegistry *ConsentRegistryCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _ConsentRegistry.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_ConsentRegistry *ConsentRegistryTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _ConsentRegistry.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_ConsentRegistry *ConsentRegistryTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _ConsentRegistry.Contract.contract.Transact(opts, method, params...)
}

// CheckAccess is a free data retrieval call binding the contract method 0xbfe9ee9b.
//
// Solidity: function checkAccess(address patient, address researcher, string recordId) view returns(bool)
func (_ConsentRegistry *ConsentRegistryCaller) CheckAccess(opts *bind.CallOpts, patient common.Address, researcher common.Address, recordId string) (bool, error) {
	var out []interface{}
	err := _ConsentRegistry.contract.Call(opts, &out, "checkAccess", patient, researcher, recordId)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// CheckAccess is a free data retrieval call binding the contract method 0xbfe9ee9b.
//
// Solidity: function checkAccess(address patient, address researcher, string recordId) view returns(bool)
func (_ConsentRegistry *ConsentRegistrySession) CheckAccess(patient common.Address, researcher common.Address, recordId string) (bool, error) {
	return _ConsentRegistry.Contract.CheckAccess(&_ConsentRegistry.CallOpts, patient, researcher, recordId)
}

// CheckAccess is a free data retrieval call binding the contract method 0xbfe9ee9b.
//
// Solidity: function checkAccess(address patient, address researcher, string recordId) view returns(bool)
func (_ConsentRegistry *ConsentRegistryCallerSession) CheckAccess(patient common.Address, researcher common.Address, recordId string) (bool, error) {
	return _ConsentRegistry.Contract.CheckAccess(&_ConsentRegistry.CallOpts, patient, researcher, recordId)
}

// HasConsent is a free data retrieval call binding the contract method 0xdbf7a00c.
//
// Solidity: function hasConsent(address patient, address researcher, string recordId) view returns(bool)
func (_ConsentRegistry *ConsentRegistryCaller) HasConsent(opts *bind.CallOpts, patient common.Address, researcher common.Address, recordId string) (bool, error) {
	var out []interface{}
	err := _ConsentRegistry.contract.Call(opts, &out, "hasConsent", patient, researcher, recordId)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// HasConsent is a free data retrieval call binding the contract method 0xdbf7a00c.
//
// Solidity: function hasConsent(address patient, address researcher, string recordId) view returns(bool)
func (_ConsentRegistry *ConsentRegistrySession) HasConsent(patient common.Address, researcher common.Address, recordId string) (bool, error) {
	return _ConsentRegistry.Contract.HasConsent(&_ConsentRegistry.CallOpts, patient, researcher, recordId)
}

// HasConsent is a free data retrieval call binding the contract method 0xdbf7a00c.
//
// Solidity: function hasConsent(address patient, address researcher, string recordId) view returns(bool)
func (_ConsentRegistry *ConsentRegistryCallerSession) HasConsent(patient common.Address, researcher common.Address, recordId string) (bool, error) {
	return _ConsentRegistry.Contract.HasConsent(&_ConsentRegistry.CallOpts, patient, researcher, recordId)
}

// GrantConsent is a paid mutator transaction binding the contract method 0x88973288.
//
// Solidity: function grantConsent(address researcher, string recordId) returns()
func (_ConsentRegistry *ConsentRegistryTransactor) GrantConsent(opts *bind.TransactOpts, researcher common.Address, recordId string) (*types.Transaction, error) {
	return _ConsentRegistry.contract.Transact(opts, "grantConsent", researcher, recordId)
}

// GrantConsent is a paid mutator transaction binding the contract method 0x88973288.
//
// Solidity: function grantConsent(address researcher, string recordId) returns()
func (_ConsentRegistry *ConsentRegistrySession) GrantConsent(researcher common.Address, recordId string) (*types.Transaction, error) {
	return _ConsentRegistry.Contract.GrantConsent(&_ConsentRegistry.TransactOpts, researcher, recordId)
}

// GrantConsent is a paid mutator transaction binding the contract method 0x88973288.
//
// Solidity: function grantConsent(address researcher, string recordId) returns()
func (_ConsentRegistry *ConsentRegistryTransactorSession) GrantConsent(researcher common.Address, recordId string) (*types.Transaction, error) {
	return _ConsentRegistry.Contract.GrantConsent(&_ConsentRegistry.TransactOpts, researcher, recordId)
}

// RevokeConsent is a paid mutator transaction binding the contract method 0xbd41ad8b.
//
// Solidity: function revokeConsent(address researcher, string recordId) returns()
func (_ConsentRegistry *ConsentRegistryTransactor) RevokeConsent(opts *bind.TransactOpts, researcher common.Address, recordId string) (*types.Transaction, error) {
	return _ConsentRegistry.contract.Transact(opts, "revokeConsent", researcher, recordId)
}

// RevokeConsent is a paid mutator transaction binding the contract method 0xbd41ad8b.
//
// Solidity: function revokeConsent(address researcher, string recordId) returns()
func (_ConsentRegistry *ConsentRegistrySession) RevokeConsent(researcher common.Address, recordId string) (*types.Transaction, error) {
	return _ConsentRegistry.Contract.RevokeConsent(&_ConsentRegistry.TransactOpts, researcher, recordId)
}

// RevokeConsent is a paid mutator transaction binding the contract method 0xbd41ad8b.
//
// Solidity: function revokeConsent(address researcher, string recordId) returns()
func (_ConsentRegistry *ConsentRegistryTransactorSession) RevokeConsent(researcher common.Address, recordId string) (*types.Transaction, error) {
	return _ConsentRegistry.Contract.RevokeConsent(&_ConsentRegistry.TransactOpts, researcher, recordId)
}

// ConsentRegistryConsentGrantedIterator is returned from FilterConsentGranted and is used to iterate over the raw logs and unpacked data for ConsentGranted events raised by the ConsentRegistry contract.
type ConsentRegistryConsentGrantedIterator struct {
	Event *ConsentRegistryConsentGranted // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *ConsentRegistryConsentGrantedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(ConsentRegistryConsentGranted)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(ConsentRegistryConsentGranted)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *ConsentRegistryConsentGrantedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *ConsentRegistryConsentGrantedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// ConsentRegistryConsentGranted represents a ConsentGranted event raised by the ConsentRegistry contract.
type ConsentRegistryConsentGranted struct {
	Patient    common.Address
	Researcher common.Address
	RecordId   string
	Raw        types.Log // Blockchain specific contextual infos
}

// FilterConsentGranted is a free log retrieval operation binding the contract event 0x8716ff8199192ae1d265d3d8a241d2e1518c992136ec8f26d77d6815937d70a8.
//
// Solidity: event ConsentGranted(address indexed patient, address indexed researcher, string recordId)
func (_ConsentRegistry *ConsentRegistryFilterer) FilterConsentGranted(opts *bind.FilterOpts, patient []common.Address, researcher []common.Address) (*ConsentRegistryConsentGrantedIterator, error) {

	var patientRule []interface{}
	for _, patientItem := range patient {
		patientRule = append(patientRule, patientItem)
	}
	var researcherRule []interface{}
	for _, researcherItem := range researcher {
		researcherRule = append(researcherRule, researcherItem)
	}

	logs, sub, err := _ConsentRegistry.contract.FilterLogs(opts, "ConsentGranted", patientRule, researcherRule)
	if err != nil {
		return nil, err
	}
	return &ConsentRegistryConsentGrantedIterator{contract: _ConsentRegistry.contract, event: "ConsentGranted", logs: logs, sub: sub}, nil
}

// WatchConsentGranted is a free log subscription operation binding the contract event 0x8716ff8199192ae1d265d3d8a241d2e1518c992136ec8f26d77d6815937d70a8.
//
// Solidity: event ConsentGranted(address indexed patient, address indexed researcher, string recordId)
func (_ConsentRegistry *ConsentRegistryFilterer) WatchConsentGranted(opts *bind.WatchOpts, sink chan<- *ConsentRegistryConsentGranted, patient []common.Address, researcher []common.Address) (event.Subscription, error) {

	var patientRule []interface{}
	for _, patientItem := range patient {
		patientRule = append(patientRule, patientItem)
	}
	var researcherRule []interface{}
	for _, researcherItem := range researcher {
		researcherRule = append(researcherRule, researcherItem)
	}

	logs, sub, err := _ConsentRegistry.contract.WatchLogs(opts, "ConsentGranted", patientRule, researcherRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(ConsentRegistryConsentGranted)
				if err := _ConsentRegistry.contract.UnpackLog(event, "ConsentGranted", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseConsentGranted is a log parse operation binding the contract event 0x8716ff8199192ae1d265d3d8a241d2e1518c992136ec8f26d77d6815937d70a8.
//
// Solidity: event ConsentGranted(address indexed patient, address indexed researcher, string recordId)
func (_ConsentRegistry *ConsentRegistryFilterer) ParseConsentGranted(log types.Log) (*ConsentRegistryConsentGranted, error) {
	event := new(ConsentRegistryConsentGranted)
	if err := _ConsentRegistry.contract.UnpackLog(event, "ConsentGranted", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// ConsentRegistryConsentRevokedIterator is returned from FilterConsentRevoked and is used to iterate over the raw logs and unpacked data for ConsentRevoked events raised by the ConsentRegistry contract.
type ConsentRegistryConsentRevokedIterator struct {
	Event *ConsentRegistryConsentRevoked // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *ConsentRegistryConsentRevokedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(ConsentRegistryConsentRevoked)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(ConsentRegistryConsentRevoked)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *ConsentRegistryConsentRevokedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *ConsentRegistryConsentRevokedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// ConsentRegistryConsentRevoked represents a ConsentRevoked event raised by the ConsentRegistry contract.
type ConsentRegistryConsentRevoked struct {
	Patient    common.Address
	Researcher common.Address
	RecordId   string
	Raw        types.Log // Blockchain specific contextual infos
}

// FilterConsentRevoked is a free log retrieval operation binding the contract event 0xdd0b330fccb4020ff86e9647f3c676f86a8d5360479b4113e4130e7ed4be1857.
//
// Solidity: event ConsentRevoked(address indexed patient, address indexed researcher, string recordId)
func (_ConsentRegistry *ConsentRegistryFilterer) FilterConsentRevoked(opts *bind.FilterOpts, patient []common.Address, researcher []common.Address) (*ConsentRegistryConsentRevokedIterator, error) {

	var patientRule []interface{}
	for _, patientItem := range patient {
		patientRule = append(patientRule, patientItem)
	}
	var researcherRule []interface{}
	for _, researcherItem := range researcher {
		researcherRule = append(researcherRule, researcherItem)
	}

	logs, sub, err := _ConsentRegistry.contract.FilterLogs(opts, "ConsentRevoked", patientRule, researcherRule)
	if err != nil {
		return nil, err
	}
	return &ConsentRegistryConsentRevokedIterator{contract: _ConsentRegistry.contract, event: "ConsentRevoked", logs: logs, sub: sub}, nil
}

// WatchConsentRevoked is a free log subscription operation binding the contract event 0xdd0b330fccb4020ff86e9647f3c676f86a8d5360479b4113e4130e7ed4be1857.
//
// Solidity: event ConsentRevoked(address indexed patient, address indexed researcher, string recordId)
func (_ConsentRegistry *ConsentRegistryFilterer) WatchConsentRevoked(opts *bind.WatchOpts, sink chan<- *ConsentRegistryConsentRevoked, patient []common.Address, researcher []common.Address) (event.Subscription, error) {

	var patientRule []interface{}
	for _, patientItem := range patient {
		patientRule = append(patientRule, patientItem)
	}
	var researcherRule []interface{}
	for _, researcherItem := range researcher {
		researcherRule = append(researcherRule, researcherItem)
	}

	logs, sub, err := _ConsentRegistry.contract.WatchLogs(opts, "ConsentRevoked", patientRule, researcherRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(ConsentRegistryConsentRevoked)
				if err := _ConsentRegistry.contract.UnpackLog(event, "ConsentRevoked", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseConsentRevoked is a log parse operation binding the contract event 0xdd0b330fccb4020ff86e9647f3c676f86a8d5360479b4113e4130e7ed4be1857.
//
// Solidity: event ConsentRevoked(address indexed patient, address indexed researcher, string recordId)
func (_ConsentRegistry *ConsentRegistryFilterer) ParseConsentRevoked(log types.Log) (*ConsentRegistryConsentRevoked, error) {
	event := new(ConsentRegistryConsentRevoked)
	if err := _ConsentRegistry.contract.UnpackLog(event, "ConsentRevoked", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
