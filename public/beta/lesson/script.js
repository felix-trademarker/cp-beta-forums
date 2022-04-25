


var vuex = JSON.parse(window.localStorage.getItem('vuex'))

fetch('api/v1/lessons/get-lesson?slug=hello-and-goodbye',{
    credentials: 'same-origin',
    headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+ vuex.token
    },
})
.then(resp => resp.json())
.then(res => {
    lessonDashboardApp.lesson = res
})