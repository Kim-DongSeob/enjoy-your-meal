//메인 페이지
function main() {
    $.ajax({
        type: "GET",
        url: "/",
        data: {},
        success: function (response) {
            location.replace("/")
        }
    })
}

// 지역별 맛집
function region() {
    $.ajax({
        type: "GET",
        url: "/region",
        data: {},
        success: function (response) {
            location.replace("/region")
        }
    })
}

// 메뉴별 맛집
function menu() {
    $.ajax({
        type: "GET",
        url: "/menu",
        data: {},
        success: function (response) {
            location.replace("/menu")
        }
    })
}

// 후기
function review() {
    $.ajax({
        type: "GET",
        url: "/review",
        data: {},
        success: function (response) {
            location.replace("/review")
        }
    })
}


// 마이페이지
function myPage() {
    $.ajax({
        type: "GET",
        url: "/mypage",
        data: {},
        success: function (response) {
            location.replace("/mypage")

        }
    })
}

function handleClickLoginPage() {
    location.href = 'login'
}

// mypage.html
function handleClickLogout() {
    location.href = 'logout'
}

function handleChangeProfileImage() {
    $('#file-save-btn').click();
}


$(document).ready(function () {
    getProfileImage();
    getLikeList();
    sortLikeList();
    randomRecommend();
    animationBanner();
})

function getProfileImage() {
    $.ajax({
        type: "GET",
        url: "/profile",
        data: {},
        success: function (response) {
            const file = response['result']
            $('#profile-img-small').attr('src', file['image_file'])
            $('#profile-img').attr('src', file['image_file'])
        }
    })
}

// login.html
function login() {
    let id = $("#user-id-login").val()
    let pw = $("#user-pw-login").val()

    $.ajax({
        type: "POST",
        url: "/login",
        data: {userid_give: id, pw_give: pw},
        success: function () {
            location.replace("/")
        },
        error: function () {
            if (id === '' || pw === '') {
                alert('아이디 혹은 비밀번호를 입력해주세요');
            } else {
                alert('아이디 혹은 비밀번호가 틀렸습니다.');
            }
        }
    })
}

// signup.html ---start
let isClicked = false;
let isExistedId = false

// 회원가입 저장
function saveUser() {
    const name = $("#user-name-signup").val()
    const id = $("#user-id-signup").val()
    const pw = $("#user-pw-signup").val()

    if (name === "" || id === "" || pw === "") {
        alert('이름, 아이디 혹은 비밀번호를 모두 입력해주세요.')
    } else if (isClicked === false) {
        alert('중복확인을 해주세요.')
    } else if (isExistedId === true) {
        alert("이미 가입된 회원입니다.")
    } else {
        $.ajax({
            type: "POST",
            url: "/signup",
            data: {name_give: name, userid_give: id, pw_give: pw},
            success: function (response) {
                alert(response["msg"]);
                location.replace("/login")
            }
        })
    }
}

// 아이디 중복 체크
function doubleCheckId() {
    const id = $("#user-id-signup").val();
    isClicked = true;

    $.ajax({
        type: "POST",
        url: "/signup/double-check",
        data: {userid_give: id},
        success: function (response) {
            alert(response["msg"]);
            isExistedId = true
        },
        error: function () {
            alert("사용 가능한 아이디입니다.");
            isExistedId = false
        }
    })
}

// signup.html ---end

// menu.html ---start

function handleKey() {
    if (window.event.keyCode === 13) {
        search();
    }
}

function search() {
    $("#menu-list").empty()

    const keywordValue = $("#search-keyword").val()
    const selectValue = $("#select-gu").val()
    console.log(selectValue)

    $.ajax({
        type: "POST",
        url: "/search",
        data: {select_value_give: selectValue, keyword_give: keywordValue},
        success: function (response) {
            const result = response["result"];
            const likeList = response['like_list']


            for (let i = 0; i < result.length; i++) {
                const name = result[i]["name"];
                const address = result[i]["address"];
                const likeCount = result[i]["like"];
                const rating = result[i]["rating"];
                const imgsrc = result[i]["imgsrc"];
                const category = result[i]["category"];

                let temp_html = '';

                if (likeList.includes(name)) {
                    temp_html = `<div id="menu-item" class="menu-item">
                                    <img src="${imgsrc}"/>
                                    <div class="item-wrapper">
                                        <div class="title">${name}</div>
                                        <div class="address">${address}</div>
                                        <div class="address">평점 : ${rating}</div>
                                        <div class="address">${category}</div>
                                            
                                        <div class="like-btn">
                                            <div class="like-count" class="${name}">${likeCount}</div>
                                            <div onclick="handleClickLike('${name}')" class="click">
                                                <img src="/static/img/icon/suit-heart-fill.svg" class="${name} active"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>`

                } else {
                    temp_html = `<div id="menu-item" class="menu-item">
                                    <img src="${imgsrc}"/>
                                    <div class="item-wrapper">
                                        <div class="title">${name}</div>
                                        <div class="address">${address}</div>
                                        <div class="address">평점 : ${rating}</div>
                                        <div class="address">${category}</div>
                                        <div class="like-btn">
                                            <div class="like-count ${name}">${likeCount}</div>
                                            <div onclick="handleClickLike('${name}')" class="click">
                                                <img src="/static/img/icon/suit-heart.svg" class="${name}"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>`
                }
                $("#menu-list").append(temp_html)
            }
        }
    })
}

// menu.html ---end

// (공통)좋아요 클릭 함수 구현 ---start
function changeLikeStatus(name) {
    const elements = document.getElementsByClassName(`${name}`);

    const countElement = elements.item(0);  // 카운트 element
    const iconElement = elements.item(1);  // 좋아요 아이콘 element

    const currentCount = countElement.innerText;
    const num = Number(currentCount);

    // const currentIcon = iconElement.classList.contains('active');
    const currentIcon = iconElement.getAttribute('src') === '/static/img/icon/suit-heart.svg';

    // console.log(currentIcon)

    if (currentIcon) {
        countElement.innerText = (num + 1).toString();
        iconElement.setAttribute('src', '/static/img/icon/suit-heart-fill.svg');
    } else {
        countElement.innerText = (num - 1).toString();
        iconElement.setAttribute('src', '/static/img/icon/suit-heart.svg');
    }
}

function changeMyLikeStatus(name) {
    const elements = document.getElementsByClassName(`${name}`);
    const container = elements.item(0);  // 좋아요 아이콘 element
    const iconElement = elements.item(1);  // 좋아요 아이콘 element

    const currentIcon = iconElement.getAttribute('src') !== '/static/img/icon/suit-heart.svg';

    if (currentIcon) {
        iconElement.setAttribute('src', '/static/img/icon/suit-heart.svg');
        container.style.transform = `translateX(1000px)`;
        container.style.height = `0`;
        container.style.margin = `0`;
        container.style.transition = `transform 0.5s ease, height 0.5s ease 0.5s, margin 0.5s ease 0.5s`;
    }
}

function handleClickLike(name) {
    $.ajax({
        type: "POST",
        url: "/like",
        data: {name_give: name},
        success: function (response) {
            changeLikeStatus(name)

            if (response['error']) {
                alert(response['error'])
                location.href = 'login'
            }
        }
    })
}

function handleClickMypageLike(name) {
    $.ajax({
        type: "POST",
        url: "/like",
        data: {name_give: name},
        success: function () {
            changeMyLikeStatus(name);
        }
    })
}

// (공통)좋아요 클릭 함수 구현 ---end


// 내가 좋아요한 맛집 리스트 ---start
function getLikeList() {
    $.ajax({
        type: "GET",
        url: "/like",
        data: {},
        success: function (response) {
            const shops = response['result']
            console.log(shops)

            for (let i = 0; i < shops.length; i++) {
                const name = shops[i]['name'];
                const address = shops[i]['address'];
                const rating = shops[i]['rating'];
                const imgsrc = shops[i]['imgsrc'];
                const category = shops[i]['category'];

                let temp_html = ` <div class="like-item ${name}">
                                    <img src="${imgsrc}" />
                                    <div class="desc-wrapper">
                                        <div class="title click">${name}</div>
                                        <div class="address">${address}</div>
                                        <div class="address">평점 : ${rating}</div>
                                        <div class="address">${category}</div>
                                    </div>
                                    <div onclick="handleClickMypageLike('${name}')" class="click" style="margin-right: 20px">
                                        <img src="/static/img/icon/suit-heart-fill.svg" style="width: 30px" class="${name}"/>
                                    </div>
                                </div>`

                $("#like-list").append(temp_html)
            }
        }
    })
}

// 내가 좋아요한 맛집 리스트 ---end

// main.html 좋아요 순위 목록 구현 ---start

function sortLikeList() {
    $.ajax({
        type: "GET",
        url: "/like/sort",
        data: {},
        success: function (response) {
            const likeList = response['result'];
            const userLikeList = response['user_like_list'];

            for (let i = 0; i < 12; i++) {
                const name = likeList[i]['name']
                const address = likeList[i]['address']
                const rating = likeList[i]['rating']
                const likeCount = likeList[i]['like']
                const imgsrc = likeList[i]['imgsrc']
                const category = likeList[i]['category']

                let temp_html = '';

                if (userLikeList.includes(name)) {
                    temp_html = `<div class="item">
                                    <img class="card-img-top" src="${imgsrc}" alt="Card image cap">
                                    <div class="item-wrapper">
                                        <div class="title">${name}</div>
                                        <div class="address">${address}</div>
                                        <div class="address">평점: ${rating}</div>
                                        <div class="address">${category}</div>
                                        <div class="like-btn">
                                            <div class="like-count ${name}">${likeCount}</div>
                                            <div onclick="handleClickLike('${name}')" class="click">
                                                <img src="/static/img/icon/suit-heart-fill.svg" class="${name} active"/>
                                            </div>
                                        </div>
                                    </div>
                                 </div>`
                } else {
                    temp_html = `<div class="item">
                                    <img class="card-img-top" src="${imgsrc}" alt="Card image cap">
                                    <div class="item-wrapper">
                                        <div class="title">${name}</div>
                                        <div class="address">${address}</div>
                                        <div class="address">평점: ${rating}</div>
                                        <div class="address">${category}</div>
                                        <div class="like-btn">
                                            <div class="like-count ${name}">${likeCount}</div>
                                            <div onclick="handleClickLike('${name}')" class="click">
                                                <img src="/static/img/icon/suit-heart.svg" class="${name}"/>
                                            </div>
                                        </div>
                                    </div>
                                 </div>`
                }
                $("#main-like-list").append(temp_html)
            }
        }
    })
}

// main.html 좋아요 순위 목록 구현 ---end


// main.html 랜덤 추천 목록 구현 ---start
function randomRecommend() {
    $.ajax({
        type: "GET",
        url: "/recommend/random",
        data: {},
        success: function (response) {
            const likeList = response['result'];
            const userLikeList = response['user_like_list'];

            for (let i = 0; i < 12; i++) {
                const name = likeList[i]['name']
                const address = likeList[i]['address']
                const rating = likeList[i]['rating']
                const likeCount = likeList[i]['like']
                const imgsrc = likeList[i]['imgsrc']
                const category = likeList[i]['category']


                let temp_html = '';

                if (userLikeList.includes(name)) {
                    temp_html = `<div class="item">
                                    <img class="card-img-top" src="${imgsrc}" alt="Card image cap">
                                    <div class="item-wrapper">
                                        <div class="title">${name}</div>
                                        <div class="address">${address}</div>
                                        <div class="address">평점: ${rating}</div>
                                        <div class="address">${category}</div>
                                        <div class="like-btn">
                                            <div class="like-count ${name}">${likeCount}</div>
                                            <div onclick="handleClickLike('${name}')" class="click">
                                                <img src="/static/img/icon/suit-heart-fill.svg" class="${name} active"/>
                                            </div>
                                        </div>
                                    </div>
                                 </div>`
                } else {
                    temp_html = `<div class="item">
                                    <img class="card-img-top" src="${imgsrc}" alt="Card image cap">
                                    <div class="item-wrapper">
                                        <div class="title">${name}</div>
                                        <div class="address">${address}</div>
                                        <div class="address">평점: ${rating}</div>
                                        <div class="address">${category}</div>
                                        <div class="like-btn">
                                            <div class="like-count ${name}">${likeCount}</div>
                                            <div onclick="handleClickLike('${name}')" class="click">
                                                <img src="/static/img/icon/suit-heart.svg" class="${name}"/>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                 </div>`
                }
                $("#main-random-list").append(temp_html)
            }
        }
    })
}

// main.html 랜덤 추천 목록 구현 ---end


// 맛집 목록 slider 구현---start
let firstNum = 0;
let secondNum = 0;

function handleClickArrowBtn(direction, order) {
    if (order === 'first') {
        const container = document.querySelector('#main-random-list');
        const next = document.querySelector('.arrow-btn.right.random');
        const prev = document.querySelector('.arrow-btn.left.random');
        if (direction === 'next' && firstNum < 3) {
            firstNum++;
            container.style.transform = `translateX(-${firstNum}00%)`;
            container.style.transition = `all .5s ease`;
        }
        if (direction === 'prev' && firstNum > 0) {
            firstNum--;
            container.style.transform = `translateX(-${firstNum}00%)`;
            container.style.transition = `all .5s ease`;
        }
        if (firstNum === 3) {
            next.style.opacity = `0`;
        } else if (firstNum === 0) {
            prev.style.opacity = `0`;
        } else {
            next.style.opacity = `1`;
            prev.style.opacity = `1`;
        }
    }
    if (order === 'second') {
        const container = document.querySelector('#main-like-list');
        const next = document.querySelector('.arrow-btn.right.like');
        const prev = document.querySelector('.arrow-btn.left.like');
        if (direction === 'next' && secondNum < 3) {
            secondNum++;
            container.style.transform = `translateX(-${secondNum}00%)`;
            container.style.transition = `all .5s ease`;
        }
        if (direction === 'prev' && secondNum > 0) {
            secondNum--;
            container.style.transform = `translateX(-${secondNum}00%)`;
            container.style.transition = `all .5s ease`;
        }
        if (secondNum === 3) {
            next.style.opacity = `0`;
        } else if (secondNum === 0) {
            prev.style.opacity = `0`;
        } else {
            next.style.opacity = `1`;
            prev.style.opacity = `1`;
        }
    }
}

// 맛집 목록 slider 구현---end

// main.html 배너 애니메이션---start
function animationBanner() {
    const bannerTitle = document.querySelector('.banner .wrapper .title');
    const bannerDesc = document.querySelector('.banner .wrapper .desc');

    bannerTitle.style.transform = `translateX(0)`;
    bannerTitle.style.opacity = `1`;

    bannerDesc.style.opacity = `1`;
}

// main.html 배너 애니메이션---end
