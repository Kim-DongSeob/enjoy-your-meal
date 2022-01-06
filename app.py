from bson import ObjectId
from flask import Flask, render_template, jsonify, request, redirect, session

app = Flask(__name__)

from pymongo import MongoClient
from datetime import timedelta
import random

# 카카오 api key 가져오는 용도---
from dotenv import load_dotenv
import os

load_dotenv()
CLIENT_ID = os.getenv("CLIENT_ID")

app.secret_key = 'SecretKey'
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(minutes=30)  # 로그인 시간
app.config['MAX_CONTENT_LENGTH'] = 3 * 1024 * 1024  # 파일업로드 용량 제한 3mb
# ----------------------------

# client = MongoClient('mongodb://test:test@localhost', 27017)
client = MongoClient('localhost', 27017)
db = client.toyproj


# db.shops.update_one({'name': '연안식당 창동점'}, {'$set': {'like': 0}})

# HTML 화면 보여주기
@app.route('/')
@app.route('/')
def home():
    if 'userid' in session:
        return render_template('main.html', login=True)
    return render_template('main.html', login=False)


@app.route('/region')
def route_region():
    if 'userid' in session:
        return render_template('region.html', CLIENT_ID=CLIENT_ID, login=True)
    return render_template('region.html', CLIENT_ID=CLIENT_ID, login=False)


@app.route('/menu')
def route_menu():
    if 'userid' in session:
        return render_template('menu.html', login=True)
    return render_template('menu.html', login=False)


@app.route('/review')
def route_review():
    if 'userid' in session:
        return render_template('review.html', login=True)
    return render_template('review.html', login=False)


@app.route('/mypage')
def route_mypage():
    if 'userid' in session:
        return render_template('mypage.html')
    return render_template('login.html')


@app.route('/signup')
def route_signup():
    return render_template('signup.html')


@app.route("/login")
def route_login():
    # print('login session', session)
    return render_template('login.html')


# 맵 마커 만들기
@app.route("/region/marker", methods=["GET"])
def marker():
    shopdata = list(db.shops.find({}, {"_id": False}))
    return jsonify({"shopdatas": shopdata})


# 회원가입 ---start
@app.route('/signup', methods=['POST'])
def save_user():
    name_receive = request.form['name_give']
    userid_receive = request.form['userid_give']
    pw_receive = request.form['pw_give']

    doc = {
        'name': name_receive,
        'userid': userid_receive,
        'pw': pw_receive,
        'like-list': []
    }
    db.users.insert_one(doc)

    # print(doc)

    return jsonify({"msg": "가입완료"})


@app.route('/signup/double-check', methods=['POST'])
def double_check_id():
    userid_receive = request.form['userid_give']
    existed_user = db.users.find_one({'userid': userid_receive})['userid']

    return jsonify({"msg": "이미 가입된 회원입니다."})


# 회원가입 ---end


# 로그인 & 로그아웃 ---start
@app.route("/login", methods=['POST'])
def login():
    userid_receive = request.form['userid_give']
    pw_receive = request.form['pw_give']

    user_info = db.users.find_one({'userid': userid_receive, 'pw': pw_receive})
    print(user_info)

    if user_info is None:
        return print('wrong')
    else:
        session['logFlag'] = True
        session['userid'] = userid_receive
        session['username'] = user_info['name']
        print('session', session)
        print('성공')

        return jsonify({'msg': '로그인 성공'})


# 로그아웃
@app.route('/logout')
def logout():
    session.clear()
    print(session)
    return redirect('/')


# 로그인 & 로그아웃 ---end


# 프로필 이미지 ---start
# 프로필 이미지 저장
@app.route('/fileupload', methods=['POST'])
def upload_file():
    image_path = 'static/uploads/' + str(session['userid'])  # 유저아이디에 따른 이미지 폴더 경로
    os.makedirs(image_path, exist_ok=True)  # 폴더 생성

    file_list = os.listdir(image_path)
    # print(file_list)
    # 이미지 업로드 전에 해당 폴더안 파일 전부 삭제 (이유는 한 유저당 프로필 이미지는 한개만 수용)
    if os.path.exists(image_path):
        for file in os.scandir(image_path):
            os.remove(file.path)

    file = request.files['file']
    # filename = secure_filename(file.filename)  # 파일이름 암호화
    filename = file.filename  # 바로 위 secure_filename을 걷어낸 이유는 secure_filename은 한글을 지원하지 않는다. 그리고 프로필이미지가 안전할 필요가 있는가?
    # print(filename)

    file.save(os.path.join(image_path, filename))  # 파일 저장

    return render_template('mypage.html')


# 프로필 이미지 get
@app.route('/profile', methods=['GET'])
def get_profile():
    if 'userid' in session:
        image_path = 'static/uploads/' + str(session['userid'])  # 유저아이디에 따른 이미지 폴더 경로
        file_list = os.listdir(image_path)

        doc = {
            'image_path': image_path,
            'image_file': image_path + "/" + file_list[0],
        }
        # print(doc)

        return jsonify({"result": doc})
    return jsonify({"result": '이미지가 없어염'})


# 프로필 이미지 ---end

# 메뉴별 맛집 리스트 ---start
@app.route("/search", methods=["POST"])
def search():
    keyword_receive = request.form["keyword_give"]
    select_value_receive = request.form["select_value_give"]

    user_like_list = ''  # 로그인 안했을 때는 여기에다가 유저가 좋아하는 목록을 담아 return 해줘야함
    if 'userid' in session:
        user = db.users.find_one({'userid': session['userid']})
        user_like_list = user['like-list']

    # regex는 db에서 특정 문자열이 포함 여부 확인
    if select_value_receive == '전체':
        search_list = list(db.shops
                           .find({'name': {"$regex": keyword_receive}}, {'_id': False}))
    elif keyword_receive == '':
        search_list = list(db.shops.find({'address': {"$regex": select_value_receive}}, {'_id': False}))
    else:
        search_list = list(
            db.shops.find({'address': {"$regex": select_value_receive}, 'name': {"$regex": keyword_receive}},
                          {'_id': False}))

    return jsonify({'result': search_list, 'like_list': user_like_list})


# 메뉴별 맛집 리스트 ---end

# 내가 좋아요 한 목록---start
@app.route("/like", methods=["GET"])
def get_like():
    shops = list()
    if 'userid' in session:
        user = db.users.find_one({'userid': session['userid']})
        user_like_list = user['like-list']

        for shop_item in user_like_list:
            shop = db.shops.find_one({'name': shop_item}, {'_id': False})
            shops.append(shop)

    return jsonify({'result': shops})


# 내가 좋아요 한 목록---end

# 좋아요 클릭 ---start
@app.route("/like", methods=["POST"])
def post_like():
    name_receive = request.form['name_give']

    if 'userid' in session:
        user = db.users.find_one({'userid': session['userid']})
        user_like_list = user['like-list']
        if name_receive in user_like_list:
            db.users.update_one({'userid': session['userid']}, {'$pull': {'like-list': name_receive}})
            db.shops.update_one({'name': name_receive}, {'$inc': {'like': -1}})
            return jsonify({'msg': '좋아요 취소'})
        elif name_receive not in user_like_list:
            db.users.update_one({'userid': session['userid']}, {'$push': {'like-list': name_receive}})
            db.shops.update_one({'name': name_receive}, {'$inc': {'like': 1}})
            return jsonify({'msg': '좋아요!'})
        else:
            db.users.update_one({'userid': session['userid']}, {'$push': {'like-list': name_receive}})
            return jsonify({'msg': '좋아요!'})
    else:
        return jsonify({'error': '로그인이 필요합니다. 로그인 페이지로 이동합니다.'})


# 좋아요 클릭---end


# 좋아요 순위별 정렬 ---start
@app.route("/like/sort", methods=["GET"])
def sort_like_list():
    like_list = list(db.shops.find({}, {'_id': False}).sort('like', -1))

    user_like_list = ''  # 로그인 안했을 때는 여기에다가 유저가 좋아하는 목록을 담아 return 해줘야함
    if 'userid' in session:
        user = db.users.find_one({'userid': session['userid']}, {'_id': False})
        user_like_list = user['like-list']

    return jsonify({'result': like_list, 'user_like_list': user_like_list})


# 좋아요 순위별 정렬 ---end


# 맛집 랜덤 추천 ---start
@app.route("/recommend/random", methods=["GET"])
def shuffle_list():
    random_list = list(db.shops.find({}, {'_id': False}))
    random.shuffle(random_list)

    user_like_list = ''  # 로그인 안했을 때는 여기에다가 유저가 좋아하는 목록을 담아 return 해줘야함
    if 'userid' in session:
        user = db.users.find_one({'userid': session['userid']}, {'_id': False})
        user_like_list = user['like-list']

    return jsonify({'result': random_list, 'user_like_list': user_like_list})


# 맛집 랜덤 추천 ---end


if __name__ == '__main__':
    app.run('0.0.0.0', port=8080, debug=True)
