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
    getProfileImage()
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
            console.log(response)
            let result = response["result"]

            for (let i = 0; i < result.length; i++) {
                let title = result[i]["name"]
                let gu = result[i]["gu"]
                let address = result[i]["address"]
                let link = result[i]["link"]
                // let address = result[i]["address"]
                // 각 요소 추가

                let temp_html = `<div class="menu-item">
                                    <div class="title" onclick="window.open('${link}')">${title}</div>
                                    <div class="address">${address}</div>
                                    <button class="btn btn-primary">좋아요</button>
                                </div>`

                $("#menu-list").append(temp_html)
            }
        }
    })
}

// menu.html ---end