// utils/sessionManager.js

// Constants for session management
const SESSION_KEY = 'user_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Creates a new user session
 * @param {Object} userData - User data to store in session
 * @param {string} userData.email - User's email
 * @returns {Object} Session data
 */
export const createSession = (userData) => {
  try {
    if (!userData || !userData.email) {
      throw new Error('Invalid user data provided');
    }

    const session = {
      email: userData.email,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString()
    };

    // Store session in localStorage
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }
};

/**
 * Checks if there's a valid active session
 * @returns {boolean} Whether there's a valid session
 */
export const checkSession = () => {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    
    if (!sessionData) {
      return false;
    }

    const session = JSON.parse(sessionData);
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    // Check if session has expired
    if (now >= expiresAt) {
      destroySession();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
};

/**
 * Gets current session data
 * @returns {Object|null} Session data if exists, null otherwise
 */
export const getSession = () => {
  try {
    if (!checkSession()) {
      return null;
    }

    const sessionData = localStorage.getItem(SESSION_KEY);
    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

/**
 * Updates existing session data
 * @param {Object} updateData - New data to update in session
 * @returns {Object} Updated session data
 */
export const updateSession = (updateData) => {
  try {
    if (!checkSession()) {
      throw new Error('No active session to update');
    }

    const currentSession = getSession();
    const updatedSession = {
      ...currentSession,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    return updatedSession;
  } catch (error) {
    console.error('Error updating session:', error);
    throw new Error('Failed to update session');
  }
};

/**
 * Destroys current session
 * @returns {void}
 */
export const destroySession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Error destroying session:', error);
    throw new Error('Failed to destroy session');
  }
};

/**
 * Extends current session duration
 * @param {number} [duration] - Duration to extend in milliseconds
 * @returns {Object} Updated session data
 */
export const extendSession = (duration = SESSION_DURATION) => {
  try {
    if (!checkSession()) {
      throw new Error('No active session to extend');
    }

    const currentSession = getSession();
    const updatedSession = {
      ...currentSession,
      expiresAt: new Date(Date.now() + duration).toISOString()
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    return updatedSession;
  } catch (error) {
    console.error('Error extending session:', error);
    throw new Error('Failed to extend session');
  }
};