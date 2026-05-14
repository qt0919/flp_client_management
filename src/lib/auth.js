/**
 * Simple client-side auth.
 * Password stored in localStorage. Session persists until logout.
 * Default password: flp2024  (change it on first login via sidebar)
 */

const KEY_PASS    = 'flp_password'
const KEY_SESSION = 'flp_authed'
const DEFAULT_PASS = 'flp2024'

export function getStoredPassword() {
  return localStorage.getItem(KEY_PASS) || DEFAULT_PASS
}

export function isLoggedIn() {
  return localStorage.getItem(KEY_SESSION) === '1'
}

export function login(password) {
  if (password === getStoredPassword()) {
    localStorage.setItem(KEY_SESSION, '1')
    return true
  }
  return false
}

export function logout() {
  localStorage.removeItem(KEY_SESSION)
}

export function changePassword(oldPass, newPass) {
  if (oldPass === getStoredPassword()) {
    localStorage.setItem(KEY_PASS, newPass)
    return true
  }
  return false
}

export function isDefaultPassword() {
  return !localStorage.getItem(KEY_PASS)
}
