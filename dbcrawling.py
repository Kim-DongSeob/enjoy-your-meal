from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time

# 크롬드라이버 버전이 저랑 맞지 않아 코드 추가했습니다. -김동섭
import chromedriver_autoinstaller

# 크롬드라이버 버전이 저랑 맞지 않아 코드 추가했습니다. -김동섭
# from selenium.webdriver.chrome.options import Options
# from selenium.webdriver.chrome.service import Service
# from webdriver_manager.chrome import ChromeDriverManager

from pymongo import MongoClient

# localhost 용 MongoDB 연결
client = MongoClient("localhost", 27017)

# 서버용 MongoDB 연결
# client = MongoClient('mongodb://test:test@localhost', 27017)

db = client.toyproj

# 코딩 시작! --------------------------------------------------------------------------------------------

# 셀레니움에 쓸 크롬 드라이버 시작
driver = webdriver.Chrome('')

# 크롬드라이버 버전이 저랑 맞지 않아 코드 추가했습니다. -김동섭
# chrome_options = webdriver.ChromeOptions()
# driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
# chrome_ver = chromedriver_autoinstaller.get_chrome_version().split('.')[0]
#
# try:
#     driver = webdriver.Chrome(f'./{chrome_ver}/chromedriver')
# except:
#     chromedriver_autoinstaller.install(True)
#     driver = webdriver.Chrome(f'./{chrome_ver}/chromedriver.exe')


# 카카오지도 들어가기
driver.get("https://map.kakao.com/")

# 주소창 찾기
elem = driver.find_element_by_name("q")

# 카카오지도는 최대 검색 페이지 제한이 있어 서울시 구 별로 검색.

seoul_gus = ["도봉구 맛집", "노원구 맛집", "강북구 맛집", "은평구 맛집","성북구 맛집", "중랑구 맛집","동대문구 맛집","종로구 맛집","서대문구 맛집",
            "중구 맛집", "성동구 맛집","광진구 맛집","용산구 맛집","마포구 맛집", "강서구 맛집","양천구 맛집","구로구 맛집","영등포구 맛집","동작구 맛집","금천구 맛집",
           "관악구 맛집","서초구 맛집","강남구 맛집","송파구 맛집","강동구 맛집"]

for seoul_gu in seoul_gus:
    elem.clear()
    elem.send_keys(seoul_gu)
    elem.send_keys(Keys.RETURN)

    # 장소 더보기 누르기
    time.sleep(0.5)
    driver.find_element_by_css_selector("#info\.search\.place\.more").send_keys(Keys.ENTER)

    # 1 페이지 돌아가기
    time.sleep(0.5)
    driver.find_element_by_id("info.search.page.no1").send_keys(Keys.ENTER)

    # 크롤링 할 페이지 개수 확인하기
    entire = driver.find_element_by_css_selector("#info\.search\.place\.cnt").text.replace(',', '')
    entire_int = int(entire)
    pages = divmod(entire_int,15)
    entire_page = pages[0]
    if entire_page > 35:
        # 카카오맵은 검색시 34페이지 제한이 존재한다. 또한 python range는 마지막수 - 1 로 검색한다.
        entire_page = 35

    print(seoul_gu, entire_page - 1)

    # 1 페이지 확인

    page_bar = driver.find_element_by_css_selector("#info\.search\.page > div")
    now_page_bar = page_bar.find_element_by_class_name("ACTIVE").text
    # print(now_page_bar)
    now_page = int(now_page_bar)
    # print(type(now_page_bar))
    
    # 페이지 자동 넘기기
    for n in range(now_page, entire_page):

        print("Now Crawling Page", n)
        # driver.find_element_by_id("info.search.page.no" + page_number).send_keys(Keys.ENTER)
        # driver.find_element_by_id("info.search.page.next").send_keys(Keys.ENTER)
        time.sleep(0.5)
        shops = driver.find_elements_by_class_name("PlaceItem")

        for shop in shops:
            # 이름
            name = shop.find_element_by_css_selector("div.head_item.clickArea > strong > a.link_name").text
            # 별점
            rating = shop.find_element_by_css_selector("div.rating.clickArea > span.score > em").text
            # 가게 종류
            category = shop.find_element_by_css_selector("div.head_item.clickArea > span").text
            # 상세보기
            link = shop.find_element_by_css_selector(
                "div.info_item > div.contact.clickArea > a.moreview").get_attribute(
                "href")
            # 주소
            address = shop.find_element_by_css_selector("div.info_item > div.addr > p:nth-child(1)").text
            # 구
            gu = seoul_gu.replace(" 맛집","")
            if rating == "":
                pass
            elif float(rating) > 4.3:
                doc = {
                    "name": name,
                    "rating": rating,
                    "category": category,
                    "link": link,
                    "gu": gu,
                    "address": address,
                    "like": 0,
                }
                print(doc)
                db.shops.insert_one(doc)

        if n == 34:
            break
        if n % 5 == 0:
            driver.find_element_by_id("info.search.page.next").send_keys(Keys.ENTER)
        elif n > 5:
            page_number = str((n % 5)+ 1)
            driver.find_element_by_id("info.search.page.no" + page_number).send_keys(Keys.ENTER)
        else:
            page_number = str(n + 1)
            driver.find_element_by_id("info.search.page.no" + page_number).send_keys(Keys.ENTER)

print("크롤링 끝!")