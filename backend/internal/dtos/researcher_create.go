package dtos

type ResearcherCreateDto struct {
	FullName          string `json:"full_name"`
	Institution       string `json:"institution"`
	Department        string `json:"department"`
	ProfessionalEmail string `json:"professional_email"`
	CredentialsURL    string `json:"credentials_url"`
	Bio               string `json:"bio"`
	WalletAddress     string `json:"wallet_address"`
}
