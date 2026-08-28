package com.hospital.service;

import com.hospital.dto.AdminLoginRequest;
import com.hospital.dto.DoctorLoginRequest;
import com.hospital.dto.LoginResponse;
import com.hospital.dto.PatientLoginRequest;
import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    private static final String ADMIN_USERNAME = "akash";
    private static final String ADMIN_PASSWORD = "262006";
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    public LoginResponse adminLogin(AdminLoginRequest request) {
        if (ADMIN_USERNAME.equals(request.getUsername()) && ADMIN_PASSWORD.equals(request.getPassword())) {
            return LoginResponse.adminSuccess(request.getUsername());
        }
        return LoginResponse.failure("Invalid admin username or password");
    }
    
    public LoginResponse doctorLogin(DoctorLoginRequest request) {
        if (request.getDoctorName() == null || request.getDoctorName().trim().isEmpty() ||
            request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            return LoginResponse.failure("Invalid doctor details");
        }
        
        Doctor doctor = doctorRepository.findByDoctorNameAndPhone(
            request.getDoctorName().trim(), 
            request.getPhone().trim()
        ).orElse(null);
        
        if (doctor != null) {
            return LoginResponse.doctorSuccess(doctor.getDoctorId(), doctor.getDoctorName());
        }
        
        return LoginResponse.failure("Invalid doctor details");
    }
    
    public LoginResponse patientLogin(PatientLoginRequest request) {
        if (request.getPatientName() == null || request.getPatientName().trim().isEmpty() ||
            request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            return LoginResponse.failure("Invalid patient details");
        }
        
        Patient patient = patientRepository.findByPatientNameAndPhone(
            request.getPatientName().trim(), 
            request.getPhone().trim()
        ).orElse(null);
        
        if (patient != null) {
            return LoginResponse.patientSuccess(patient.getPatientId(), patient.getPatientName());
        }
        
        return LoginResponse.failure("Invalid patient details");
    }
}
