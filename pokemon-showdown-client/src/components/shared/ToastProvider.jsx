import {createContext, useContext, useState, useCallback, useRef} from 'react'
import './Toast.css'

const ToastContext = createContext(null)

export function useToast() {
	return useContext(ToastContext)
}

export function ToastProvider({children}) {
	const [toasts, setToasts] = useState([])
	const idRef = useRef(0)

	const addToast = useCallback((message, type = 'info', duration = 3000) => {
		const id = ++idRef.current
		setToasts(prev => [...prev, {id, message, type, exiting: false}])

		// Start exit animation before removal
		setTimeout(() => {
			setToasts(prev => prev.map(t => t.id === id ? {...t, exiting: true} : t))
			setTimeout(() => {
				setToasts(prev => prev.filter(t => t.id !== id))
			}, 400)
		}, duration)

		return id
	}, [])

	const removeToast = useCallback((id) => {
		setToasts(prev => prev.map(t => t.id === id ? {...t, exiting: true} : t))
		setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400)
	}, [])

	return (
		<ToastContext.Provider value={{addToast, removeToast}}>
			{children}
			<div className="toast-container" aria-live="polite">
				{toasts.map(toast => (
					<div
						key={toast.id}
						className={`toast toast--${toast.type} ${toast.exiting ? 'toast--exit' : ''}`}
						onClick={() => removeToast(toast.id)}
					>
						<span className="toast__icon">{ICONS[toast.type]}</span>
						<span className="toast__message">{toast.message}</span>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	)
}

const ICONS = {
	info: 'ℹ',
	success: '✓',
	warning: '⚠',
	damage: '⚔',
	crit: '💥',
	faint: '☠',
}
