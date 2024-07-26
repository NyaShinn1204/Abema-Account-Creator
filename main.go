package main

import (
	"fmt"
	"strconv"

	"github.com/BurntSushi/toml"
)

type Config struct {
	General GeneralConfig
	Payment PaymentConfig
}

type GeneralConfig struct {
	Threads int  `toml:"threads"`
	Debug   bool `toml:"debug"`
}

type PaymentConfig struct {
	Cc_number    string `toml:"cc_number"`
	Cc_exp_month string `toml:"cc_exp_month"`
	Cc_exp_year  string `toml:"cc_exp_year"`
	Cc_name      string `toml:"cc_name"`
	Cc_cvv       string `toml:"cc_cvv"`
}

func main() {
	var config Config
	_, err := toml.DecodeFile("config.toml", &config)
	if err != nil {
		panic(err)
	}
	//fmt.Printf("DB Username is :%s\n", config.General.Threads)
	//fmt.Printf("DB Password is :%s\n", config.Payment.Cc_number)
	fmt.Printf("Threads >> %s\n", strconv.Itoa(config.General.Threads))
}
