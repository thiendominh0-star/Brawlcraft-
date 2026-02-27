import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {login, register} from '../../services/authStore.js'
import './Login.css'

export default function Login() {
	const navigate = useNavigate()
	const [isRegister, setIsRegister] = useState(false)
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	const handleSubmit = (e) => {
		e.preventDefault()
		setError('')
		setSuccess('')

		try {
			if (isRegister) {
				// Luồng Đăng ký
				register(username, password)
				setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay.')
				setIsRegister(false) // tự chuyển lại màn login
			} else {
				// Luồng Đăng nhập
				login(username, password)
				navigate('/')
			}
		} catch (err) {
			setError(err.message)
		}
	}

	const toggleMode = () => {
		setIsRegister(!isRegister)
		setError('')
		setSuccess('')
	}

	return (
		<div className="login-page">
			<div className="login-page__grid-bg" aria-hidden />

			<div className="login-card animate-fadeInUp">
				<div className="login-card__header">
					<span className="login-card__icon">⬣</span>
					<h1 className="login-card__title font-display">BRAWLCRAFT</h1>
					<p className="login-card__subtitle">
						{isRegister ? 'Tạo tài khoản mới' : 'Authenticate to continue'}
					</p>
				</div>

				<form className="login-form" onSubmit={handleSubmit}>
					{error && <div className="login-error">{error}</div>}
					{success && <div className="login-success">{success}</div>}

					<div className="login-field">
						<label>Username</label>
						<input
							type="text"
							placeholder="Nhập tên tài khoản"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							autoFocus
						/>
					</div>

					<div className="login-field">
						<label>Password</label>
						<input
							type="password"
							placeholder="Nhập mật khẩu"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>

					<button type="submit" className="btn btn-primary login-btn">
						{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
					</button>
				</form>

				<p className="login-hint">
					{isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
					<strong onClick={toggleMode} style={{cursor: 'pointer', color: 'var(--accent-blue)'}}>
						{isRegister ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
					</strong>
				</p>
			</div>
		</div>
	)
}
