const client = stitch.Stitch.initializeDefaultAppClient('STITCH_PROJECT_NAME');

init()

async function init() {
    if (!client.auth.isLoggedIn) {
        document.getElementById("login").style.display = "block";

        document.getElementById("logout").style.display = "none";
        document.getElementById("blogForm").style.display = "none";

        clearBlogs()
        return
    }

    document.getElementById("login").style.display = "none";

    document.getElementById("blogForm").style.display = "block";
    document.getElementById("logout").style.display = "block";

    listBlogs()
}

async function loginForm(e) {
    e.preventDefault()
    await sLogin()
    init()
}

async function sRegister() 
{
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const emailPasswordClient = client.auth.getProviderClient(stitch.UserPasswordAuthProviderClient.factory);

    emailPasswordClient.registerWithEmail(username, password)
        .then(async () => {
            await sLogin()
            await callFunc('setUserRoleCall', [])
            init()
        })
        .catch(err => console.error("Error registering new user:", err));
}


async function sLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username.length < 1 || password.length < 1) return

    const cred = new stitch.UserPasswordCredential(username, password);

    await client.auth.loginWithCredential(cred).then(user => {
        return user
    }).catch(err => {
        console.error(err)
        return
    });
}

async function listBlogs() {
    blogs = await callFunc('listBlogs', [])
    console.log(blogs)

    if (blogs.length < 1) return;

    clearBlogs()

    blogs.forEach(function (ele) {
        let cNode = document.createElement('li')
        cNode.className = 'list-group-item formShowButton formHide'
        cNode.setAttribute('blog', ele._id)

        let tNode = document.createElement('h5')
        let tNodeText = document.createTextNode(ele.title)
        tNode.appendChild(tNodeText)
        cNode.appendChild(tNode)

        let bNode = document.createElement('p')
        let bNodeText = document.createTextNode(ele.body)
        bNode.appendChild(bNodeText)
        cNode.appendChild(bNode)

        if (client.auth.user.id == ele.author) {

            let formTitle = document.createElement('div')
            formTitle.classList.add('form-group', 'mt-1')
            formTitle.innerHTML = `<input type="text" class="form-control intitle" intitle name="intitle" value="${ele.title}">`
            cNode.appendChild(formTitle)

            let formBody = document.createElement('div')
            formBody.classList.add('form-group', 'mt-1')
            formBody.innerHTML = `<textarea class="form-control inbody" inbody name="inbody">${ele.body}</textarea>`
            cNode.appendChild(formBody)

            let delNode = document.createElement('div')
            delNode.classList.add('row', 'mt-2')
            delNode.innerHTML = "<button type='button' onclick='openEditor()' class='btn btn-sm btn-secondary text-left ml-3 mr-2 ebutton'>Edit</submit> <button type='button' onclick='EditBlog()' class='btn btn-sm btn-success text-left ml-3 mr-2 insubmit'>Update</submit> <button type='button' class='btn btn-sm btn-danger text-right' onclick=\"deleteBlog('" + ele._id + "')\">Delete</button>"

            cNode.appendChild(delNode)
        }

        document.getElementById('blogList').appendChild(cNode)
    });
}

async function addBlog(e) {
    e.preventDefault()

    form = document.getElementById('blogForm')

    title = document.getElementById('blogTitle').value
    body = document.getElementById('blogBody').value
    post = { title, body }

    console.log(post)

    const res = await callFunc('addBlog', [post])
    console.log(res)

    listBlogs()
}

function addblog() {
    title = document.getElementById('blogTitle').value
    body = document.getElementById('blogBody').value
    post = { title, body }

    db.insertOne(post)
        .then(bg => console.log(bg))
        .catch(ee => console.log(ee))
}

function openEditor()
{
    delElem = event.srcElement.parentElement.parentElement

    delElem.classList.remove('formShowButton', 'formHide')
    delElem.classList.add('formHideButton', 'formShow')

}

async function EditBlog()
{
    delElem = event.srcElement.parentElement.parentElement

    const id = delElem.getAttribute('blog')
    const title = delElem.querySelector("input[name='intitle']").value
    const body = delElem.querySelector("textarea[name='inbody']").value
    const data = {id, title, body}

    console.log(data)

    const res = await callFunc('updateBlog', [data])

    listBlogs()
}

async function deleteBlog(id) {
    const res = await callFunc('deleteBlog', [id])
    console.log(res)

    if (res.done) listBlogs()
}

function clearBlogs() {
    document.getElementById('blogList').innerHTML = '';
}

async function logOut() {
    await client.auth.logout();
    init();
}

async function callFunc(funcName, args = []) {
    return client.callFunction(funcName, args).then(result => {
        return result;
    }).catch(err => err);
}