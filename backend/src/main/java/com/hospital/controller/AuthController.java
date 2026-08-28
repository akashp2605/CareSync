package com.hospital.controller;

import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if ("akash".equals(username) && "262006".equals(password)) {
            Map<String, Object> response = new HashMap<>();
            response.put("role", "ADMIN");
            response.put("username", "akash");
            return ResponseEntity.ok(response);
        }

        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Invalid admin username or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    @PostMapping("/doctor/login")
    public ResponseEntity<?> doctorLogin(@RequestBody Map<String, String> request) {
        String doctorName = request.get("doctorName");
        String phone = request.get("phone");

        if (doctorName == null || phone == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Doctor Name and Phone Number are required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }

        String nameToSearch = doctorName.trim();
        Optional<Doctor> doctorOpt = doctorRepository.findByDoctorNameAndPhone(nameToSearch, phone.trim());
        if (!doctorOpt.isPresent()) {
            if (nameToSearch.toLowerCase().startsWith("dr. ")) {
                nameToSearch = "Dr. " + nameToSearch.substring(4).trim();
                doctorOpt = doctorRepository.findByDoctorNameAndPhone(nameToSearch, phone.trim());
            } else {
                doctorOpt = doctorRepository.findByDoctorNameAndPhone("Dr. " + nameToSearch, phone.trim());
            }
        }
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("role", "DOCTOR");
            response.put("doctorId", doctor.getDoctorId());
            response.put("doctorName", doctor.getDoctorName());
            return ResponseEntity.ok(response);
        }

        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Invalid doctor details");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    @PostMapping("/patient/login")
    public ResponseEntity<?> patientLogin(@RequestBody Map<String, String> request) {
        String patientName = request.get("patientName");
        String phone = request.get("phone");

        if (patientName == null || phone == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Patient Name and Phone Number are required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }

        Optional<Patient> patientOpt = patientRepository.findByPatientNameAndPhone(patientName.trim(), phone.trim());
        if (patientOpt.isPresent()) {
            Patient patient = patientOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("role", "PATIENT");
            response.put("patientId", patient.getPatientId());
            response.put("patientName", patient.getPatientName());
            return ResponseEntity.ok(response);
        }

        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Invalid patient details");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }
}
