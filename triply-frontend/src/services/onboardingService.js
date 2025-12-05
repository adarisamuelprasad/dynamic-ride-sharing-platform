export const onboardingService = {
    generatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    },

    sendWelcomeEmail(email, name) {
        // This would typically call a backend endpoint
        console.log(`Welcome email sent to ${name} (${email})`);
    }
};
