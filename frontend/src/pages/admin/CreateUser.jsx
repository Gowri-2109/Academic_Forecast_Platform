import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './AdminForms.css'; // We'll use a shared forms CSS

const CreateUser = () => {
    const [userType, setUserType] = useState('student'); // 'student', 'faculty'
    const [loading, setLoading] = useState(false);

    // Bulk Upload State


    // Shared Fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState('');
    const [address, setAddress] = useState('');
    const [age, setAge] = useState('');
    const [department, setDepartment] = useState('');

    // Student Only Fields
    const [registerNumber, setRegisterNumber] = useState('');
    const [year, setYear] = useState('');




    const handleSubmit = async (e) => {
        e.preventDefault();
        



        if (userType === 'student') {
            const regEx = /^7376231EC\d{3}$/i;
            if (!regEx.test(registerNumber)) {
                toast.error("Register Number must follow the format 7376231ECxxx (e.g., 7376231EC001)");
                return;
            }
        }

        setLoading(true);

        const payload = {
            email, password, dob, address, age, department
        };

        try {
            if (userType === 'faculty') {
                payload.first_name = firstName;
                payload.last_name = lastName;
                await api.post('/faculties', payload);
                toast.success('🎉 Faculty user created successfully!');
            } else {
                // For student, our legacy API accepted 'name'. We combine it here:
                payload.name = `${firstName} ${lastName}`;
                payload.register_number = registerNumber;
                payload.year = year;
                await api.post('/students', payload);
                toast.success('🎉 Student user created successfully!');
            }
            
            // Clear form
            setEmail(''); setPassword(''); setFirstName(''); setLastName('');
            setDob(''); setAddress(''); setAge(''); setDepartment('');
            setRegisterNumber(''); setYear('');

        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-form-container fade-in">
            <div className="form-header">
                <h2>Create New User</h2>
                <div className="type-toggle">
                    <button 
                        className={userType === 'student' ? 'active' : ''} 
                        onClick={() => setUserType('student')}
                        type="button"
                    >Student</button>
                    <button 
                        className={userType === 'faculty' ? 'active' : ''} 
                        onClick={() => setUserType('faculty')}
                        type="button"
                    >Faculty</button>

                </div>
            </div>

            <form onSubmit={handleSubmit} className="complex-form">


                    <>
                        <div className="form-row">
                            <div className="form-group half">
                                <label>First Name *</label>
                                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                            </div>
                            <div className="form-group half">
                                <label>Last Name *</label>
                                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Email Address *</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <div className="form-group half">
                                <label>Password *</label>
                                <input type="text" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Temporary Password" />
                            </div>
                        </div>

                        {userType === 'student' && (
                            <div className="form-row slide-down" style={{marginBottom: '15px'}}>
                                <div className="form-group half">
                                    <label>Register Number *</label>
                                    <input type="text" value={registerNumber} onChange={e => setRegisterNumber(e.target.value)} required />
                                </div>
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Date of Birth</label>
                                <input type="date" value={dob} onChange={e => setDob(e.target.value)} />
                            </div>
                            <div className="form-group quarter">
                                <label>Age</label>
                                <input type="number" value={age} onChange={e => setAge(e.target.value)} />
                            </div>
                            <div className="form-group quarter">
                                <label>Department</label>
                                <input type="text" value={department} onChange={e => setDepartment(e.target.value)} />
                            </div>
                        </div>

                        <div className="form-group full">
                            <label>Place / Full Address</label>
                            <textarea value={address} onChange={e => setAddress(e.target.value)} rows="2"></textarea>
                        </div>

                        {userType === 'student' && (
                            <div className="form-row slide-down">
                                <div className="form-group half">
                                    <label>Academic Year</label>
                                    <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 1, 2, 3, 4" />
                                </div>
                            </div>
                        )}
                    </>


                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Processing...' : `Create ${userType === 'faculty' ? 'Faculty' : 'Student'} Profile`}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateUser;
