export const getUserNicknameFromEmail = (email) => {
    if (!email) return '';
    return email.split('@')[0];
}