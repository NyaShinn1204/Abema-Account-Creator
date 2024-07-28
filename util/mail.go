package util

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"golang.org/x/exp/rand"
)

func Gen_email(tempmail string, session *http.Client, poipoi_token string, poipoi_sessionhash string) (string, string, error) {
	for {
		//fmt.Println(tempmail)
		if tempmail == "tempmail.lol" {
			req, err := http.NewRequest("GET", "https://api.tempmail.lol/generate/rush", nil)
			if err != nil {
				fmt.Println(err)
			}
			req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36")

			resp, err := session.Do(req)
			if err != nil {
				fmt.Println(err)
			}
			defer resp.Body.Close()

			var mailReq map[string]interface{}
			if err := json.NewDecoder(resp.Body).Decode(&mailReq); err != nil {
				fmt.Println(err)
			}

			//fmt.Println(resp.StatusCode)
			if resp.StatusCode == http.StatusOK {
				email := mailReq["address"].(string)
				token := mailReq["token"].(string)
				//fmt.Println(email, token)
				//fmt.Println(email, token)
				return email, token, err

			}
			if resp.StatusCode == 429 {
				fmt.Println("Error: Ratelimited")
				return "", "", err
			} else {
				fmt.Println("Error: Failed Get Mail Status Code: ", resp.StatusCode)
				return "", "", err
			}
		}
		if tempmail == "tempmail.io" {
			req, err := http.NewRequest("POST", "https://api.internal.temp-mail.io/api/v3/email/new", nil)
			if err != nil {
				fmt.Println(err)
				return "", "", err
			}
			req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36")

			resp, err := session.Do(req)
			if err != nil {
				fmt.Println(err)
				return "", "", err
			}
			defer resp.Body.Close()

			var mailReq map[string]interface{}
			if err := json.NewDecoder(resp.Body).Decode(&mailReq); err != nil {
				fmt.Println(err)
				return "", "", err
			}

			//fmt.Println(resp.StatusCode)
			if resp.StatusCode == http.StatusOK {
				email := mailReq["email"].(string)
				token := mailReq["token"].(string)
				//fmt.Println(email, token)
				//fmt.Println(email, token)
				return email, token, err

			}
			if resp.StatusCode == 429 {
				fmt.Println("Error: Ratelimited")
				return "", "", err
			} else {
				fmt.Println("Error: Failed Get Mail Status Code: ", resp.StatusCode)
				return "", "", err
			}
		}
		if tempmail == "m.kuku.lu" {
			randomname := "nyagenv2-" + random_string(5) + "-" + random_number(4)
			// m.kuku.lu JAPAN ONLY DOMAIN LIST
			domains := []string{
				"tatsu.uk", "cocoro.uk", "onlyapp.net", "shchiba.uk", "eripo.net",
				"nyasan.com", "xmailer.be", "na-cat.com", "exdonuts.com", "mama3.org",
				"fukurou.ch", "nezumi.be", "okinawa.li", "nekochan.fr", "sofia.re",
				"kagi.be", "nagi.be",
			}

			randomIndex := rand.Intn(len(domains))

			random_domain := domains[randomIndex]

			req, err := http.NewRequest("GET", fmt.Sprintf("https://m.kuku.lu/index.php?action=addMailAddrByManual&by_system=1&csrf_token_check=%s&newdomain=%s&newuser=%s", poipoi_token, random_domain, randomname), nil)
			if err != nil {
				return "", "", err
			}

			cookieCsrf := &http.Cookie{Name: "cookie_csrf_token", Value: poipoi_token}
			cookieSessionhash := &http.Cookie{Name: "cookie_sessionhash", Value: poipoi_sessionhash}

			req.AddCookie(cookieCsrf)
			req.AddCookie(cookieSessionhash)

			resp, err := session.Do(req)
			if err != nil {
				return "", "", err
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				return "", "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
			}

			body, err := ioutil.ReadAll(resp.Body)
			if err != nil {
				return "", "", err
			}

			email := strings.Replace(string(body), "OK:", "", 1)

			if strings.HasPrefix(email, "NG:") {
				// NGの場合は再生成する
				return "", "", err
			}

			return email, "", nil
		}
	}
}

func random_string(num int) string {

	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	password := make([]byte, num)
	for i := range password {
		password[i] = letters[rand.Intn(len(letters))]
	}
	return string(password)
}

func random_number(length int) string {
	digits := "0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = digits[rand.Intn(len(digits))]
	}
	return string(b)
}
