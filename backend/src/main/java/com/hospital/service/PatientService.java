package com.hospital.service;

import com.hospital.controller.PatientController;
import com.hospital.entity.Patient;
import com.hospital.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    public Patient add(Patient p) {
        return patientRepository.save(p);
    }

    public List<Patient> getAll() {
        return patientRepository.findAll();
    }

    public Patient getById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Patient Not Found"));
    }

    public Patient update(Long id, Patient p) {
        Patient pp=getById(id);
        pp.setPatientName(p.getPatientName());
        pp.setAge(p.getAge());
        pp.setPhone(p.getPhone());
        pp.setEmail(p.getEmail());
        pp.setAddress(p.getAddress());
        pp.setGender(p.getGender());
        pp.setBloodGroup(p.getBloodGroup());
        return patientRepository.save(pp);
    }

    public String deleteById(Long id) {
        Patient p=getById(id);
         patientRepository.deleteById(id);
        return "Patient Deleted Successfully";
    }
}
