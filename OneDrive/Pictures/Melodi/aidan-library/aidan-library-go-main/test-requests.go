package main

type Item struct {
	Name string `json:"name"`
	Price string `json:"price"`
	Change24h string `json:"change24h"`
	Change7d string `json:"change7d"`
	MainCategory string `json:"maincategory"`
	ProfitVsTrader string `json:"profitvstrader"`
	Trader string `json:"trader"`
	TraderPrice string `json:"traderprice"`
}

/* func main() {
	iteminfo := requests.Get("https://api.aidanneel.xyz/get-items?item=bitcoin", &Item{})

	fmt.Println(iteminfo.(*Item).TraderPrice)
} */