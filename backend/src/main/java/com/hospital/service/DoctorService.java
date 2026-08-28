package com.hospital.service;

import com.hospital.entity.Doctor;
import com.hospital.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;


    public Doctor add(Doctor d) {
        return doctorRepository.save(d);
    }

    public List<Doctor> getAll() {
        return doctorRepository.findAll();
    }

    public Doctor update(Long id, Doctor d) {
        Doctor dd=getById(id);
        dd.setDoctorName(d.getDoctorName());
        dd.setSpecialization(d.getSpecialization());
        dd.setPhone(d.getPhone());
        dd.setEmail(d.getEmail());
        dd.setQualification(d.getQualification());
        dd.setExperience(d.getExperience());
        dd.setAddress(d.getAddress());
        dd.setDept(d.getDept());
        dd.setSpeciality(d.getSpeciality());
        return doctorRepository.save(dd);
    }

    public Doctor getById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Doctor Not Found"));
    }

    public String deleteById(Long id) {
        Doctor d=getById(id);
        doctorRepository.delete(d);
        return "Doctor Deleted Successfully";
    }
}
