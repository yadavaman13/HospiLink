const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require("../models/user.model");
const Hospital = require("../models/hospital.model");

/**
 * Create demo data for testing appointment booking flow
 * POST /api/demo/setup
 * Creates: 2 hospitals, 6 doctors, and returns login tokens
 */
async function setupDemoData(req, res) {
  try {
    // Clear existing demo data (optional - for testing)
    // await User.deleteMany({ email: { $regex: /demo.*@test\.com/ } });

    // Hospital 1: City General Hospital
    const hosp1 = await Hospital.findOneAndUpdate(
      { hospitalId: 'HOSP_DEMO_001' },
      {
        hospitalId: 'HOSP_DEMO_001',
        name: 'City General Hospital',
        status: 'approved',
        address: {
          street: '123 Medical Lane',
          city: 'Bangalore',
          state: 'KA',
          zip: '560001',
          country: 'India'
        },
        contact: {
          phone: '080-1234-5678',
          email: 'admin@citygeneral.com'
        },
        departments: [
          { name: 'Cardiology', headDoctor: 'Dr. Rajesh Kumar' },
          { name: 'Neurology', headDoctor: 'Dr. Priya Singh' },
          { name: 'General', headDoctor: 'Dr. Amit Patel' }
        ],
        beds: { total: 150, available: 75 }
      },
      { upsert: true, new: true }
    );

    // Hospital 2: Apollo Care Center
    const hosp2 = await Hospital.findOneAndUpdate(
      { hospitalId: 'HOSP_DEMO_002' },
      {
        hospitalId: 'HOSP_DEMO_002',
        name: 'Apollo Care Center',
        status: 'approved',
        address: {
          street: '456 Health Avenue',
          city: 'Hyderabad',
          state: 'TG',
          zip: '500001',
          country: 'India'
        },
        contact: {
          phone: '040-9876-5432',
          email: 'admin@apollocare.com'
        },
        departments: [
          { name: 'Cardiology', headDoctor: 'Dr. Vikram Sharma' },
          { name: 'Orthopedics', headDoctor: 'Dr. Neha Verma' },
          { name: 'General', headDoctor: 'Dr. Suresh Rao' }
        ],
        beds: { total: 200, available: 120 }
      },
      { upsert: true, new: true }
    );

    // Demo Doctors Data
    const doctorsData = [
      {
        firstName: 'Rajesh',
        lastName: 'Kumar',
        email: 'demo.rajesh@test.com',
        specialization: 'Cardiology',
        department: 'Cardiology',
        hospital: hosp1,
        yearsOfExperience: 15,
        rating: 4.8,
        consultationFee: 500,
        consultationDuration: 30,
        bio: 'Senior Cardiologist with expertise in heart surgery',
      },
      {
        firstName: 'Priya',
        lastName: 'Singh',
        email: 'demo.priya@test.com',
        specialization: 'Neurology',
        department: 'Neurology',
        hospital: hosp1,
        yearsOfExperience: 12,
        rating: 4.7,
        consultationFee: 450,
        consultationDuration: 30,
        bio: 'Experienced neurologist specializing in migraine and stroke care',
      },
      {
        firstName: 'Amit',
        lastName: 'Patel',
        email: 'demo.amit@test.com',
        specialization: 'General Medicine',
        department: 'General',
        hospital: hosp1,
        yearsOfExperience: 8,
        rating: 4.5,
        consultationFee: 300,
        consultationDuration: 25,
        bio: 'General physician with focus on preventive healthcare',
      },
      {
        firstName: 'Vikram',
        lastName: 'Sharma',
        email: 'demo.vikram@test.com',
        specialization: 'Cardiology',
        department: 'Cardiology',
        hospital: hosp2,
        yearsOfExperience: 18,
        rating: 4.9,
        consultationFee: 600,
        consultationDuration: 35,
        bio: 'Leading cardiologist with 18 years of experience',
      },
      {
        firstName: 'Neha',
        lastName: 'Verma',
        email: 'demo.neha@test.com',
        specialization: 'Orthopedics',
        department: 'Orthopedics',
        hospital: hosp2,
        yearsOfExperience: 10,
        rating: 4.6,
        consultationFee: 400,
        consultationDuration: 30,
        bio: 'Orthopedic specialist treating bone and joint disorders',
      },
      {
        firstName: 'Suresh',
        lastName: 'Rao',
        email: 'demo.suresh@test.com',
        specialization: 'General Medicine',
        department: 'General',
        hospital: hosp2,
        yearsOfExperience: 7,
        rating: 4.4,
        consultationFee: 350,
        consultationDuration: 25,
        bio: 'Compassionate general physician with patient-first approach',
      },
    ];

    // Create doctors
    const createdDoctors = [];
    for (const docData of doctorsData) {
      const existingDoctor = await User.findOne({ email: docData.email });
      
      if (existingDoctor) {
        createdDoctors.push(existingDoctor);
        continue;
      }

      const tempPassword = `Doc${crypto.randomBytes(4).toString('hex')}!`;
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const doctor = await User.create({
        hospitalId: docData.hospital.hospitalId,
        role: 'doctor',
        email: docData.email,
        password: hashedPassword,
        status: 'active',
        profile: {
          firstName: docData.firstName,
          lastName: docData.lastName,
          phone: `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
          gender: Math.random() > 0.5 ? 'male' : 'female',
          specialization: docData.specialization,
          department: docData.department,
          licenseNumber: `LIC${Math.random().toString(36).substring(2, 11).toUpperCase()}`
        },
        doctorProfile: {
          yearsOfExperience: docData.yearsOfExperience,
          consultationFee: docData.consultationFee,
          consultationDuration: docData.consultationDuration,
          rating: docData.rating,
          bio: docData.bio,
          weeklySchedule: {
            monday: { start: '09:00', end: '18:00', available: true },
            tuesday: { start: '09:00', end: '18:00', available: true },
            wednesday: { start: '09:00', end: '18:00', available: true },
            thursday: { start: '09:00', end: '18:00', available: true },
            friday: { start: '09:00', end: '17:00', available: true },
            saturday: { start: '10:00', end: '14:00', available: true },
            sunday: { start: '00:00', end: '00:00', available: false }
          },
          blockedDates: [],
          onBreak: false
        }
      });
      createdDoctors.push(doctor);
    }

    // Create a demo patient for testing
    const demoPatientEmail = 'demo.patient@test.com';
    let demoPatient = await User.findOne({ email: demoPatientEmail });

    if (!demoPatient) {
      const patientPassword = 'DemoPatient@123';
      const hashedPassword = await bcrypt.hash(patientPassword, 10);

      demoPatient = await User.create({
        role: 'patient',
        email: demoPatientEmail,
        password: hashedPassword,
        status: 'active',
        profile: {
          firstName: 'Demo',
          lastName: 'Patient',
          phone: '+919876543210',
          gender: 'male',
          age: 35,
          medicalHistory: ['Hypertension']
        }
      });
    }

    // Return demo credentials
    res.json({
      success: true,
      message: 'Demo data created successfully',
      hospitals: [
        {
          hospitalId: hosp1.hospitalId,
          name: hosp1.name,
          city: hosp1.address.city,
          doctors: createdDoctors.filter(d => d.hospitalId === hosp1.hospitalId).map(d => ({
            _id: d._id,
            name: `Dr. ${d.profile.firstName} ${d.profile.lastName}`,
            specialization: d.profile.specialization,
            rating: d.doctorProfile.rating,
            fee: d.doctorProfile.consultationFee
          }))
        },
        {
          hospitalId: hosp2.hospitalId,
          name: hosp2.name,
          city: hosp2.address.city,
          doctors: createdDoctors.filter(d => d.hospitalId === hosp2.hospitalId).map(d => ({
            _id: d._id,
            name: `Dr. ${d.profile.firstName} ${d.profile.lastName}`,
            specialization: d.profile.specialization,
            rating: d.doctorProfile.rating,
            fee: d.doctorProfile.consultationFee
          }))
        }
      ],
      demoPatient: {
        email: demoPatientEmail,
        password: 'DemoPatient@123',
        message: 'Use these credentials to login as a patient and test booking'
      }
    });

  } catch (error) {
    console.error('Demo setup error:', error);
    res.status(500).json({ message: 'Failed to setup demo data', error: error.message });
  }
}

module.exports = { setupDemoData };
