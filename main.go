package main

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/cookiejar"
	"os"
	"os/signal"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/BurntSushi/toml"
	"github.com/PuerkitoBio/goquery"
	"github.com/google/uuid"
	"github.com/robertkrimen/otto"

	mail "generator/util"
)

// COLOR
var Reset = "\033[0m"
var Red = "\033[31m"
var Green = "\033[32m"
var Yellow = "\033[33m"
var Blue = "\033[34m"
var Magenta = "\033[35m"
var Cyan = "\033[36m"
var Gray = "\033[37m"
var White = "\033[97m"

type Config struct {
	General  GeneralConfig
	Tempmail TempmailConfig
	Payment  PaymentConfig
}

type GeneralConfig struct {
	Threads int     `toml:"threads"`
	Debug   bool    `toml:"debug"`
	Delay   float64 `toml:"delay"`
}

type TempmailConfig struct {
	Service            string `toml:"service"`
	Poipoi_token       string `toml:"poipoi_token"`
	Poipoi_sessionhash string `toml:"poipoi_sessionhash"`
}

type PaymentConfig struct {
	Cc_number    string `toml:"cc_number"`
	Cc_exp_month string `toml:"cc_exp_month"`
	Cc_exp_year  string `toml:"cc_exp_year"`
	Cc_name      string `toml:"cc_name"`
	Cc_cvv       string `toml:"cc_cvv"`
}

var config Config

type TokenResponse struct {
	TokenObject struct {
		Token string `json:"token"`
	} `json:"tokenObject"`
}

var verify_code string

var tempmail_lol_inbox []interface{}
var tempmail_io_inbox []interface{}

func main() {
	_, err := toml.DecodeFile("config.toml", &config)
	if err != nil {
		panic(err)
	}

	tempmail := config.Tempmail.Service

	if tempmail == "" {
		panic("[-] Please Insert Service name")
	}

	fmt.Printf("Threads >> %d\n", config.General.Threads)
	fmt.Printf("Delay >> %f seconds\n", config.General.Delay)

	// シグナルチャンネルを作成して、SIGINT（Ctrl+C）とSIGTERMをキャッチする
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	// ゴルーチンの同期を取るためのWaitGroup
	var wg sync.WaitGroup

	// スレッド数と間隔
	numThreads := config.General.Threads
	interval := time.Duration(config.General.Delay * float64(time.Second))

	resultChan := make(chan []byte, numThreads)

	// コンテキストを作成
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// スレッドを生成するためのルーチン
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	quit := make(chan struct{})

	go func() {
		for {
			select {
			case <-ticker.C:
				for i := 0; i < numThreads; i++ {
					wg.Add(1)
					go main_thread(ctx, tempmail, &wg, resultChan)
				}
			case <-quit:
				return
			}
		}
	}()

	// 結果を受け取り、表示するゴルーチン
	go func() {
		for result := range resultChan {
			result = result
			// ここのコードを見つけた君！よくやったな！
			// もちろんこのコードは使われていない、消すのめんどくさいから=で無理やりエラーを回避
			// これ消すのに何分かかるんだか...

			// 消し方:
			// func main_thread()の引用のresultChanを削除
			// ここの go func() {}の部分を丸々削除
			// これでクソコードは消えます
		}
	}()

	// シグナルを待ち、受け取ったらプログラムを終了する
	go func() {
		<-sigs
		close(quit)
		cancel()  // すべてのゴルーチンにキャンセルシグナルを送る
		wg.Wait() // すべてのゴルーチンが終了するのを待つ
		fmt.Println("\nReceived an interrupt, stopping...")
		os.Exit(0)
	}()

	// メインゴルーチンが終了しないようにする
	select {}
}

func main_thread(ctx context.Context, tempmail string, wg *sync.WaitGroup, resultChan chan<- []byte) {
	defer wg.Done()
	select {
	case <-ctx.Done():
		fmt.Println("Thread cancelled")
		return
	default:
		jar, err := cookiejar.New(nil)
		if err != nil {
			panic(err)
		}

		s := time.Now()

		poipoi_token := ""
		poipoi_sessionhash := ""
		if tempmail == "m.kuku.lu" {
			if config.Tempmail.Poipoi_token == "" || config.Tempmail.Poipoi_sessionhash == "" {
				panic("[-] Please Insert Token, Sessionhash!!")
			} else {
				poipoi_token = config.Tempmail.Poipoi_token
				poipoi_sessionhash = config.Tempmail.Poipoi_sessionhash
			}
		}
		session := &http.Client{Timeout: time.Duration(10 * time.Second), Jar: jar}
		password := "password"
		accountUUID := uuid.New()
		applicationKeySecret := generate_applicationkeysecret(accountUUID.String())

		email, email_token, err := mail.Gen_email(tempmail, session, poipoi_token, poipoi_sessionhash)
		if err != nil {
			fmt.Println("Error:", err)
			panic(err)
		}

		payment_url := gen_payment_url()
		premium_token, err := gen_token(payment_url)

		jsonData1 := map[string]string{
			"deviceId":             accountUUID.String(),
			"applicationKeySecret": applicationKeySecret,
		}
		jsonBytes1, _ := json.Marshal(jsonData1)

		resp1, err := http.Post("https://api.p-c3-e.abema-tv.com/v1/users", "application/json", bytes.NewBuffer(jsonBytes1))
		if err != nil {
			fmt.Println("Error:", err)
			panic(1)
		}
		defer resp1.Body.Close()

		body, err := ioutil.ReadAll(resp1.Body)
		if err != nil {
			fmt.Println("Error reading response body:", err)
			panic(1)
		}

		if resp1.StatusCode == http.StatusOK {
			var response map[string]interface{}
			if err := json.Unmarshal(body, &response); err != nil {
				fmt.Println("Error decoding response body:", err)
				panic(1)
			}

			abema_token, ok := response["token"].(string)
			if !ok {
				fmt.Println("Error: token field is missing or not a string")
				panic(1)
			}

			profile, ok := response["profile"].(map[string]interface{})
			if !ok {
				fmt.Println("Error: profile field is missing or not a map")
				panic(1)
			}
			userID, ok := profile["userId"].(string)
			if !ok {
				fmt.Println("Error: userId field is missing or not a string")
				panic(1)
			}

			fmt.Println("NyaGenV2 - "+Magenta+"[GETTED..]"+Reset+"          UserID -> ", userID, "                Status -> ", resp1.StatusCode)

			jsonData2 := map[string]interface{}{
				"email": email,
			}
			jsonBytes2, err := json.Marshal(jsonData2)
			if err != nil {
				fmt.Println("Error encoding JSON data:", err)
				panic(1)
			}

			req, err := http.NewRequest("PUT", "https://api.p-c3-e.abema-tv.com/v1/users/"+userID+"/email", bytes.NewBuffer(jsonBytes2))
			if err != nil {
				fmt.Println("Error creating request:", err)
				panic(1)
			}

			req.Header.Set("Authorization", "bearer "+abema_token)
			req.Header.Set("Content-Type", "application/json")

			resp2, err := session.Do(req)
			if err != nil {
				fmt.Println("Error sending request:", err)
				panic(1)
			}
			defer resp2.Body.Close()

			if resp2.StatusCode == http.StatusAccepted {

				if tempmail == "m.kuku.lu" {
					// メールが存在するかのチェック
					for {
						response, err := http.NewRequest("GET", fmt.Sprintf("https://m.kuku.lu/recv._ajax.php?&q=%s 【ABEMA】メールアドレス登録確認&csrf_token_check=%s", email, poipoi_token), nil)
						if err != nil {
							fmt.Println("Error:", err)
							panic(1)
						}

						cookieCsrf := &http.Cookie{Name: "cookie_csrf_token", Value: poipoi_token}
						cookieSessionhash := &http.Cookie{Name: "cookie_sessionhash", Value: poipoi_sessionhash}

						response.AddCookie(cookieCsrf)
						response.AddCookie(cookieSessionhash)

						resp3, err := session.Do(response)
						if err != nil {
							fmt.Println("Error:", err)
							panic(1)
						}

						defer resp3.Body.Close()

						doc, err := goquery.NewDocumentFromResponse(resp3)
						if err != nil {
							fmt.Println("Error parsing HTML:", err)
							panic(1)
						}

						if doc.Find("span.view_listcnt").Text() == "1" {
							//fmt.Println("m.kuku.lu PASSED!!!")
							break
						}
						time.Sleep(2 * time.Second)
					}
				}
				if tempmail == "tempmail.lol" {
					//メールが存在するかのチェック、存在したらメールのデータをtempmail_lol_inboxに指定
					for {
						time.Sleep(1 * time.Second)
						url := fmt.Sprintf("https://api.tempmail.lol/auth/%s", email_token)
						req, err := http.NewRequest("GET", url, nil)
						if err != nil {
							panic(1)
						}

						resp, err := session.Do(req)
						if err != nil {
							panic(1)
						}

						if resp.StatusCode != http.StatusOK {
							resp.Body.Close()
							fmt.Println("Error:", fmt.Errorf("unexpected status code: %d", resp.StatusCode))
							panic(1)
						}

						defer resp.Body.Close()

						var response map[string]interface{}
						if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
							panic(1)
						}

						emails, ok := response["email"].([]interface{})
						if !ok || len(emails) == 0 {
							time.Sleep(2 * time.Second)
							continue
						}
						// Assuming only one email is expected, return the first one
						if len(emails) >= 1 {
							//fmt.Println(email, token)
							//fmt.Println("tempmail.lol PASSED!!!")
							tempmail_lol_inbox = emails
							//fmt.Println(url)
							break
							// emailsスライスをループして、"認証コード"が含まれているかどうかをチェック
							// emailsスライスをループして、"認証コード"が含まれているかどうかをチェック
							// インターフェースの値を文字列にキャストし、"認証コード"が含まれているかどうかをチェック
							// 各メールの本文について確認
							// 各メールの本文について確認
							//for _, emailBody := range emails {
							//	// map型であることを確認
							//	if emailMap, ok := emailBody.(map[string]interface{}); ok {
							//		// "body"キーが存在するかどうかを確認
							//		if body, ok := emailMap["body"].(string); ok {
							//			// 認証コードを含むかどうかを確認
							//			if strings.Contains(body, "認証コード") {
							//				fmt.Println("認証コードが含まれています")
							//				tempmail_lol_inbox = emails
							//				break
							//			} else {
							//				fmt.Println("認証コードが含まれていません")
							//				time.Sleep(2 * time.Second)
							//				continue
							//			}
							//		} else {
							//			fmt.Println("メールの本文が文字列ではありません")
							//		}
							//	} else {
							//		fmt.Println("メールがmap[string]interface{}型ではありません")
							//	}
							//}
						}
					}
				}
				if tempmail == "tempmail.io" {
					//メールが存在するかのチェック、存在したらメールのデータをtempmail_lol_inboxに指定
					for {
						time.Sleep(1 * time.Second)
						url := fmt.Sprintf("https://api.internal.temp-mail.io/api/v3/email/%s/messages", email)
						req, err := http.NewRequest("GET", url, nil)
						if err != nil {
							panic(1)
						}

						resp, err := session.Do(req)
						if err != nil {
							panic(1)
						}

						if resp.StatusCode != http.StatusOK {
							resp.Body.Close()
							fmt.Println("Error:", fmt.Errorf("unexpected status code: %d", resp.StatusCode))
							panic(1)
						}

						defer resp.Body.Close()

						var response []map[string]interface{}
						if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
							fmt.Println(err)
							panic(1)
						}

						if len(response) == 0 {
							time.Sleep(2 * time.Second)
							continue
						}

						// Assuming only one email is expected, return the first one
						if len(response) >= 1 {
							// 型変換を行う
							tempmail_io_inbox = make([]interface{}, len(response))
							for i, v := range response {
								tempmail_io_inbox[i] = v
							}
							break
							// emailsスライスをループして、"認証コード"が含まれているかどうかをチェック
							for _, emailBody := range response {
								// map型であることを確認
								if body, ok := emailBody["body"].(string); ok {
									// 認証コードを含むかどうかを確認
									if strings.Contains(body, "認証コード") {
										fmt.Println("認証コードが含まれています")
										tempmail_lol_inbox = make([]interface{}, len(response))
										for i, v := range response {
											tempmail_lol_inbox[i] = v
										}
										break
									} else {
										fmt.Println("認証コードが含まれていません")
										time.Sleep(2 * time.Second)
										continue
									}
								} else {
									fmt.Println("メールの本文が文字列ではありません")
								}
							}
						}
					}
				}

				if tempmail == "m.kuku.lu" {
					response, err := http.NewRequest("GET", fmt.Sprintf("https://m.kuku.lu/recv._ajax.php?&q=%s 【ABEMA】メールアドレス登録確認&csrf_token_check=%s", email, poipoi_token), nil)
					if err != nil {
						fmt.Println("Error:", err)
						panic(1)
					}

					cookieCsrf := &http.Cookie{Name: "cookie_csrf_token", Value: poipoi_token}
					cookieSessionhash := &http.Cookie{Name: "cookie_sessionhash", Value: poipoi_sessionhash}

					response.AddCookie(cookieCsrf)
					response.AddCookie(cookieSessionhash)

					resp4, err := session.Do(response)
					if err != nil {
						fmt.Println("Error:", err)
						panic(1)
					}

					defer resp4.Body.Close()

					doc, err := goquery.NewDocumentFromResponse(resp4)
					if err != nil {
						fmt.Println("Error parsing HTML:", err)
						panic(1)
					}

					mailElement := doc.Find("div.content-primary.main-content [style='z-index:99;']")
					scriptElement := mailElement.Parent().Find("script").Eq(2).Text()

					re := regexp.MustCompile(`'.*?'`)
					parsedJavascript := re.FindAllString(scriptElement, -1)
					if len(parsedJavascript) >= 3 {
						num := strings.ReplaceAll(parsedJavascript[2], "'", "")
						key := strings.ReplaceAll(parsedJavascript[3], "'", "")

						response2, err := http.NewRequest("GET", fmt.Sprintf("https://m.kuku.lu/smphone.app.recv.view.php?num=%s&key=%s", num, key), nil)
						if err != nil {
							fmt.Println("Error:", err)
							panic(1)
						}

						resp5, err := session.Do(response2)
						if err != nil {
							fmt.Println("Error:", err)
							panic(1)
						}

						defer resp5.Body.Close()

						doc, err = goquery.NewDocumentFromResponse(resp5)
						if err != nil {
							fmt.Println("Error parsing HTML:", err)
							panic(1)
						}
						authCodeDiv := doc.Find("div:contains('認証コード:')")
						if authCodeDiv.Length() > 0 {
							text := authCodeDiv.Text()
							verifyCode := strings.Split(text, ":") // 最後の要素を取得
							verify_code = strings.TrimSpace(verifyCode[len(verifyCode)-1])
						} else {
							fmt.Println("認証コードが見つかりませんでした。")
							panic(1)
						}
					}
				}

				if tempmail == "tempmail.lol" {
					// 正規表現パターンを定義
					pattern := regexp.MustCompile(`認証コード: (\d+)`)

					// データを文字列として取り出す
					body, ok := tempmail_lol_inbox[0].(map[string]interface{})["body"].(string)
					if !ok {
						fmt.Println("メールが見つかりませんでした。")
						panic(1)
					}

					// 正規表現で認証コードを検索
					match := pattern.FindStringSubmatch(body)
					if len(match) < 2 {
						fmt.Println(tempmail_lol_inbox[0])
						fmt.Println("認証コードが見つかりませんでした。")
						panic(1)
					}
					verify_code = match[1]
				}
				if tempmail == "tempmail.io" {
					// tempmail_io_inbox[0] が map[string]interface{} 型であるか確認
					emailData, ok := tempmail_io_inbox[0].(map[string]interface{})
					if !ok {
						//fmt.Println("tempmail_io_inbox[0] が map[string]interface{} 型ではありません。")
						panic(1)
					}

					// "body_text" フィールドが存在し、文字列型であるか確認
					body, ok := emailData["body_text"].(string)
					if !ok {
						panic(1)
					}

					// 正規表現パターンを定義
					pattern := regexp.MustCompile(`認証コード: (\d+)`)

					// 正規表現で認証コードを検索
					match := pattern.FindStringSubmatch(body)
					if len(match) < 2 {
						panic(1)
					}

					// 認証コードを出力
					verify_code = match[1]
				}

				jsonData3 := map[string]interface{}{
					"token": verify_code,
				}
				jsonBytes3, err := json.Marshal(jsonData3)
				if err != nil {
					fmt.Println("Error encoding JSON data:", err)
					panic(1)
				}

				req5, err := http.NewRequest("POST", fmt.Sprintf("https://api.p-c3-e.abema-tv.com/v1/users/%s/tokens/email", userID), bytes.NewBuffer(jsonBytes3))
				if err != nil {
					fmt.Println("Error verifying email:", err)
					panic(1)
				}

				req5.Header.Set("Authorization", "bearer "+abema_token)
				req5.Header.Set("Content-Type", "application/json")

				resp6, err := session.Do(req5)
				if err != nil {
					fmt.Println("Error sending request:", err)
					panic(1)
				}
				defer resp6.Body.Close()

				if resp6.StatusCode == http.StatusOK {
					fmt.Println("NyaGenV2 - "+Magenta+"[VERIFY..]"+Reset+"      VerifyCode -> ", verify_code, "                        Status -> ", resp1.StatusCode)
				}

				setPasswordJSON := map[string]interface{}{
					"token":           verify_code,
					"password":        password,
					"skippedPassword": false,
				}
				setPasswordJSONBytes, _ := json.Marshal(setPasswordJSON)
				setPasswordURL := fmt.Sprintf("https://api.p-c3-e.abema-tv.com/v1/users/%s/tokens/email/r", userID)
				//fmt.Println(setPasswordURL)
				setPasswordReq, err := http.NewRequest("PUT", setPasswordURL, bytes.NewBuffer(setPasswordJSONBytes))
				if err != nil {
					fmt.Println("Error verifying email:", err)
					panic(1)
				}
				setPasswordReq.Header.Set("Authorization", "bearer "+abema_token)
				setPasswordReq.Header.Set("Content-Type", "application/json")

				setPasswordResponse, err := session.Do(setPasswordReq)
				if err != nil {
					fmt.Println("Error sending request:", err)
					panic(1)
				}

				defer setPasswordResponse.Body.Close()

				if setPasswordResponse.StatusCode == http.StatusOK {
					jsonData4 := map[string]interface{}{
						"token": premium_token,
					}
					jsonBytes4, err := json.Marshal(jsonData4)
					if err != nil {
						fmt.Println("Error encoding JSON data:", err)
						panic(1)
					}

					req6, err := http.NewRequest("POST", fmt.Sprintf("https://api.p-c3-e.abema-tv.com/v1/users/%s/payments/credit", userID), bytes.NewBuffer(jsonBytes4))
					if err != nil {
						fmt.Println("Error verifying email:", err)
						panic(1)
					}

					req6.Header.Set("Authorization", "bearer "+abema_token)
					req6.Header.Set("Content-Type", "application/json")

					resp7, err := session.Do(req6)
					if err != nil {
						fmt.Println("Error sending request:", err)
						panic(1)
					}
					defer resp7.Body.Close()

					jsonData5 := map[string]interface{}{
						"code":      "",
						"productId": "subscription_premium",
					}
					jsonBytes5, err := json.Marshal(jsonData5)
					if err != nil {
						fmt.Println("Error encoding JSON data:", err)
						panic(1)
					}

					req7, err := http.NewRequest("POST", fmt.Sprintf("https://api.p-c3-e.abema-tv.com/v1/users/%s/subscriptions/credit", userID), bytes.NewBuffer(jsonBytes5))
					if err != nil {
						fmt.Println("Error verifying email:", err)
						panic(1)
					}

					req7.Header.Set("Authorization", "bearer "+abema_token)
					req7.Header.Set("Content-Type", "application/json")

					resp8, err := session.Do(req7)
					if err != nil {
						fmt.Println("Error sending request:", err)
						panic(1)
					}
					defer resp8.Body.Close()

					if resp8.StatusCode == http.StatusOK {
						unsubscriptionJSON := map[string]interface{}{
							"productId": "subscription_premium",
						}
						unsubscriptionJSONBytes, _ := json.Marshal(unsubscriptionJSON)
						unsubscriptionURL := fmt.Sprintf("https://api.p-c3-e.abema-tv.com/v1/users/%s/subscriptions/credit/cancel", userID)
						unsubscriptionReq, err := http.NewRequest("POST", unsubscriptionURL, bytes.NewBuffer(unsubscriptionJSONBytes))
						if err != nil {
							fmt.Println("Error verifying email:", err)
							panic(1)
						}
						unsubscriptionReq.Header.Set("Authorization", "bearer "+abema_token)
						unsubscriptionReq.Header.Set("Content-Type", "application/json")
						unsubscriptionResponse, err := session.Do(unsubscriptionReq)
						if err != nil {
							fmt.Println("Error sending request:", err)
							panic(1)
						}
						defer unsubscriptionResponse.Body.Close()

						byteArray, err := ioutil.ReadAll(unsubscriptionReq.Body)
						if err != nil {
							fmt.Println(err)
						}
						bytes := []byte(byteArray)
						err = json.Unmarshal(bytes, &response)

						if unsubscriptionResponse.StatusCode == http.StatusOK {
							end_time := time.Since(s)
							ended_time := end_time.Seconds()
							fmt.Println("NyaGenV2 - "+Green+"[UNLOCK..]"+Reset+"        Password -> ", password, "                        Mail -> ", email, " Time -> ", fmt.Sprintf("%.2f秒", ended_time), " UserID -> ", userID)

							file, err := os.OpenFile("abema-account.txt", os.O_WRONLY|os.O_APPEND|os.O_CREATE, 0666)
							if err != nil {
								//エラー処理
								log.Fatal(err)
							}
							defer file.Close()
							fmt.Fprintln(file, fmt.Sprintf("%s@%s", email, password)) //書き込み
							data := map[string]interface{}{
								"result": "success",
								"code":   "200",
								"response": map[string]interface{}{
									"email":    email,
									"password": password,
									"userid":   userID,
									"time":     time.Since(s).String(),
								},
							}
							encode_response, err := json.Marshal(data)
							if err != nil {
								fmt.Printf("could not marshal json: %s\n", err)
								panic(1)
							}
							result := []byte(encode_response)
							resultChan <- result
						} else {
							fmt.Println("トライアル解除に失敗しました。")
							panic(1)
						}
					} else {
						fmt.Println("プレミアムプランの適応に失敗しました")
						panic(1)
					}
				} else {
					fmt.Println("パスワードの設定に失敗しました。")
					panic(1)
				}
			} else {
				fmt.Println("認証メールの送信に失敗しました。")
				panic(1)
			}
		} else {
			fmt.Println("ユーザーの取得に失敗しました。")
			panic(1)
		}
	}
}

func gen_payment_url() string {
	vm := otto.New()
	card_obj := config.Payment.Cc_number + "|" + config.Payment.Cc_exp_year + config.Payment.Cc_exp_month + "|" + config.Payment.Cc_cvv + "|" + config.Payment.Cc_name + "|"
	vm.Set("cardobj", card_obj)
	script, err := vm.Compile("payment.min.v2.4.js", nil)
	if err != nil {
		fmt.Println(err)
		panic(1)
	}
	value, err := vm.Run(script)
	if err != nil {
		fmt.Println(value)
	}
	if value, err := vm.Get("payment_url"); err == nil {

		valueStr, err := value.ToString()
		if err != nil {
			fmt.Println("URLの変換に失敗しました:", err)
			panic(1)
		}
		return valueStr
	} else {
		panic("failed to get payment_url")
	}
	return ""
}

// プレースホルダを置換するヘルパー関数
func replacePlaceholder(code, placeholder, value string) string {
	return strings.ReplaceAll(code, placeholder, value)
}

func gen_token(paymenturl string) (string, error) {
	// HTTP POSTリクエストを送信
	resp, err := http.Post(paymenturl, "application/json", nil)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// レスポンスボディを読み取る
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	// レスポンスボディの一部を抽出してJSON文字列を取得
	jsonStr := string(body)
	jsonStr = strings.TrimPrefix(jsonStr, "onNyaGenV2(")
	jsonStr = strings.TrimSuffix(jsonStr, ")")

	// JSON文字列をパースしてtokenを取り出す
	var data TokenResponse
	if err := json.Unmarshal([]byte(jsonStr), &data); err != nil {
		return "", err
	}

	return data.TokenObject.Token, nil
}

func generate_applicationkeysecret(deviceid string) string {
	var SECRETKEY = []byte("v+Gjs=25Aw5erR!J8ZuvRrCx*rGswhB&qdHd_SYerEWdU&a?3DzN9BRbp5KwY4hEmcj5#fykMjJ=AuWz5GSMY-d@H7DMEh3M@9n2G552Us$$k9cD=3TxwWe86!x#Zyhe")
	var t = (time.Now().Unix() + 60*60) / 3600 * 3600
	var t_struct = time.Unix(t, 0).UTC()
	var t_str = strconv.FormatInt(t, 10)
	var mac = hmac.New(sha256.New, SECRETKEY)
	mac.Write(SECRETKEY)
	var tmp = mac.Sum(nil)
	for i := 0; i < int(t_struct.Month()); i++ {
		mac = hmac.New(sha256.New, SECRETKEY)
		mac.Write(tmp)
		tmp = mac.Sum(nil)
	}
	mac = hmac.New(sha256.New, SECRETKEY)
	mac.Write([]byte(base64.RawURLEncoding.EncodeToString(tmp) + deviceid))
	tmp = mac.Sum(nil)
	for i := 0; i < t_struct.Day()%5; i++ {
		mac = hmac.New(sha256.New, SECRETKEY)
		mac.Write(tmp)
		tmp = mac.Sum(nil)
	}
	mac = hmac.New(sha256.New, SECRETKEY)
	mac.Write([]byte(base64.RawURLEncoding.EncodeToString(tmp) + t_str))
	tmp = mac.Sum(nil)
	for i := 0; i < t_struct.Hour()%5; i++ {
		mac = hmac.New(sha256.New, SECRETKEY)
		mac.Write(tmp)
		tmp = mac.Sum(nil)
	}
	return base64.RawURLEncoding.EncodeToString(tmp)
}
