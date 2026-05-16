const bcrypt = require('bcrypt');
const User = require('../models/user.model');

const DEFAULT_SUPER_ADMIN = {
    email: 'admin@hospilink.com',
    password: 'Admin123',
    profile: {
        firstName: 'Super',
        lastName: 'Admin',
        phone: '9999999999',
        gender: 'other'
    }
};

async function bootstrapSuperAdmin() {
    const existing = await User.findOne({ email: DEFAULT_SUPER_ADMIN.email }).select('+password');

    if (existing) {
        let needsSave = false;

        if (existing.role !== 'super_admin') {
            existing.role = 'super_admin';
            existing.hospitalId = null;
            needsSave = true;
        }

        if (existing.status !== 'active') {
            existing.status = 'active';
            needsSave = true;
        }

        if (needsSave) {
            await existing.save();
            console.log('Updated existing account to default super-admin state');
        }

        return existing;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_SUPER_ADMIN.password, 10);

    const superAdmin = await User.create({
        hospitalId: null,
        role: 'super_admin',
        email: DEFAULT_SUPER_ADMIN.email,
        password: hashedPassword,
        status: 'active',
        profile: DEFAULT_SUPER_ADMIN.profile
    });

    console.log('Created default super admin account');
    return superAdmin;
}

module.exports = bootstrapSuperAdmin;
