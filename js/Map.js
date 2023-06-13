var mapContainer = document.getElementById("map"), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(35.13417, 129.11397), // 지도의 중심좌표
    level: 6, // 지도의 확대 레벨
    mapTypeId: kakao.maps.MapTypeId.ROADMAP, // 지도종류
  };

// 지도를 생성
var map = new kakao.maps.Map(mapContainer, mapOption);
var markers = [];

// 장소 검색 객체를 생성
var ps = new kakao.maps.services.Places();

// 검색창에 이름 검색 함수를 추가
var searchForm = document.getElementsByClassName("search-button")[0];
searchForm?.addEventListener("click", function (e) {
  e.preventDefault();
  searchOnJson();

})


// 주소 - 좌표 변환 객체 생성
var geocoder = new kakao.maps.services.Geocoder();

var jsonData;

function getJsonData() {
  fetch("../json/parsing2.json")
    .then((res) => {
      return res.json();
    })
    .then((obj) => {
      jsonData = obj;
    })
}

getJsonData();

// 이름(keyword)으로 json 인덱스를 찾는 함수
function searchOnJson() {
  var keyword = document.getElementById("keyword").value;
  List(jsonData, keyword);
  // 이름, 주소를 받아와 마커와 미리보기창을 생성하는 함수
  function List(obj, keyword) {
    hideMarkers();
    // markers 배열 초기화
    markers.splice(0, markers.length);

    const name = obj.map(v => v.saeopjangNm);    
    const address = obj.map(v => v.addr);

    var indexes = [];

    for (i = 0; i < obj.length; i++) {
        if (name[i].includes(keyword)) {
            indexes.push(i);
        }
    }

    if(indexes.length === 0) {
      alert("검색 결과가 없습니다.");
    }

    for(let i of indexes) {  
      var coords;
      // 주소로 좌표를 검색
      geocoder.addressSearch(address[i], function (result, status) {
        // 정상적으로 검색이 완료됐으면 
        if (status === kakao.maps.services.Status.OK) {
          coords = new kakao.maps.LatLng(result[0].y, result[0].x);
      
          // 결과값으로 받은 위치를 마커로 표시, addMarker에서 미리보기창도 생성
          addMarker(coords, i);
          // 지도의 중심을 결과값으로 받은 위치로 이동
          map.setCenter(coords);
        }
      }); 
    }
  }
}

// 카카오 맵의 장소 데이터를 활용하는 함수
// function keywordSearch() {
//   searchPlaces();

//   // 키워드 검색을 요청
//   function searchPlaces() {
//     var keyword = document.getElementById("keyword").name;
//     ps.keywordSearch(keyword, placesSearchCB);
//   }

//   // 키워드 검색 완료 시 호출되는 함수
//   function placesSearchCB(data, status, pagination) {
//     if (status === kakao.maps.services.Status.OK) {
//       displayPlaces(data);
//     } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
//       alert("No Result");
//       return;
//     }
//   }

//   function displayPlaces(places) {
//     hideMarkers();
//     for (var i = 0; i < places.length; i++) {
//       var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
//         marker = addMarker(placePosition, i);

//       bounds.extend(placePosition);
//     }
//     map.setBounds(bounds);
//   }
// }

// 마커를 생성하는 함수
function addMarker(position, index) {
  const marker = new kakao.maps.Marker({
    position: position,
  });

  // 마커를 지도에 표시한다
  marker.setMap(map);

  markers.push(marker);

  // 마커에 click 이벤트를 등록한다
  kakao.maps.event.addListener(marker, "mouseover", showPreviewWindow(position, index));
  kakao.maps.event.addListener(marker, "mouseout", hidePreviewWindow());
  kakao.maps.event.addListener(marker, "click", showOffcanvas(index));
}

// 배열에 추가된 마커들을 지도에 표시하거나 삭제하는 함수
function setMarkers(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// 배열에 추가된 마커를 지도에 표시하는 함수
function showMarkers() {
  setMarkers(map);
}

// 배열에 추가된 마커를 지도에서 삭제하는 함수
function hideMarkers() {
  setMarkers(null);
}

// 마커 위에 표시할 미리보기창, 유일 객체
var previewWindow = new kakao.maps.CustomOverlay({
  position: new kakao.maps.LatLng(35.13499, 129.1039),
  clickable: true,
  // x, y 위치, 기본 : 0.5
  xAnchor: 0.5,
  yAnchor: 1.3,
});

// 미리보기창을 표시하는 함수
function showPreviewWindow(position, i) {
  return function () {
    // 미리보기창 위치를 변경한다
    previewWindow.setPosition(position);

    // 변경될 내용
    var content =
      '<div id="previewWindow">' +
        '<div id="previewName">' +
          jsonData[i]['saeopjangNm'] +
        '</div>' +
        '<div id="previewAddress">' +
          jsonData[i].addr +
        '</div><br>' +
      '</div>';


    // 미리보기창 내용을 변경한다.
    previewWindow.setContent(content);
    // 미리보기창을 맵 위에 표시한다.
    previewWindow.setMap(map);

    // 로컬 저장소에 name을 임시저장한다.
    // localStorage.setItem('name', name);
  };
}

function hidePreviewWindow() {
  return function () {
    previewWindow.setMap(null);
  }
}

// 고용업종명 ~ 상시인원 주소 배열
var contents = document.getElementsByClassName("content");

// 상세 정보를 오프캔버스로 띄움
function showOffcanvas(i) {
  return function() {
    var offcanvasElement = document.getElementById('offcanvas');
    var offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    document.getElementById("name").innerHTML = jsonData[i]['saeopjangNm'];
    document.getElementById("address").innerHTML = jsonData[i]['addr'];
    document.getElementById("companyNumber").innerHTML = "사업자등록번호: " + jsonData[i]['saeopjaDrno'];
    contents[0].innerHTML = jsonData[i]['gyEopjongNm'];
    contents[1].innerHTML = jsonData[i]['gyEopjongCd'];
    contents[4].innerHTML = jsonData[i]['seongripDt'];
  }
}
