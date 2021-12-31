from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

from pymongo import MongoClient

# 카카오 api key 가져오는 용도---
from dotenv import load_dotenv
import os

load_dotenv()
CLIENT_ID = os.getenv("CLIENT_ID")
# ----------------------------

# client = MongoClient('mongodb://test:test@localhost', 27017)
client = MongoClient('localhost', 27017)
db = client.toyproj


# HTML 화면 보여주기
@app.route('/')
def home():
    return render_template('/main.html')

@app.route('/region')
def region():
    return render_template('region.html',CLIENT_ID=CLIENT_ID)

@app.route('/menu')
def menu():
    return render_template('menu.html')

@app.route('/review')
def review():
    return render_template('review.html')

@app.route('/mypage')
def mypage():
    return render_template('mypage.html')


# 맵 마커 만들기
@app.route("/region/marker", methods=["GET"])
def marker():
    shopdata = list(db.shops.find({},{"_id":False}))
    return jsonify({"shopdatas":shopdata})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
