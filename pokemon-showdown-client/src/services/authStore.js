/**
 * authStore.js
 * Quản lý trạng thái đăng ký / đăng nhập (Lưu mock Database trong localStorage)
 */

const AUTH_KEY = 'brawlcraft_user_auth'
const DB_KEY = 'brawlcraft_users_db'

// "Cơ sở dữ liệu" (Array các user object)
function getDB() {
	try {
		const raw = localStorage.getItem(DB_KEY)
		if (raw) return JSON.parse(raw)
	} catch (e) { /* ignore */}

	// Mặc định luôn có một tài khoản Admin ẩn sẵn trong DB khi mới cài (seed data)
	const defaultAdmin = {username: 'admin', password: '1', displayName: 'Admin', isAdmin: true}
	localStorage.setItem(DB_KEY, JSON.stringify([defaultAdmin]))
	return [defaultAdmin]
}

function saveDB(db) {
	localStorage.setItem(DB_KEY, JSON.stringify(db))
}

export function register(username, password) {
	if (!username || username.trim() === '') throw new Error('Tài khoản không được trống')
	if (!password || password.trim() === '') throw new Error('Mật khẩu không được trống')

	const normalized = username.trim().toLowerCase()
	const db = getDB()

	// Validate duplicate
	if (db.find(u => u.username === normalized)) {
		throw new Error('Tên tài khoản này đã có người sử dụng!')
	}

	// Create user (Mặc định khi người chơi đăng ký thì isAdmin = false)
	const newUser = {
		username: normalized,
		password: password.trim(),
		displayName: username.trim(),
		isAdmin: false
	}

	db.push(newUser)
	saveDB(db)

	return newUser
}

export function login(username, password) {
	if (!username || username.trim() === '') throw new Error('Cần nhập tài khoản')
	if (!password || password.trim() === '') throw new Error('Cần nhập mật khẩu')

	const normalized = username.trim().toLowerCase()
	const db = getDB()

	const user = db.find(u => u.username === normalized)
	if (!user) throw new Error('Tài khoản không tồn tại!')

	if (user.password !== password.trim()) throw new Error('Sai mật khẩu!')

	// Lưu session đăng nhập hiện tại
	localStorage.setItem(AUTH_KEY, JSON.stringify({
		username: user.username,
		displayName: user.displayName,
		isAdmin: user.isAdmin
	}))

	return user
}

export function logout() {
	localStorage.removeItem(AUTH_KEY)
}

export function getCurrentUser() {
	try {
		const raw = localStorage.getItem(AUTH_KEY)
		if (raw) return JSON.parse(raw)
	} catch (e) { /* ignore */}
	return null
}
