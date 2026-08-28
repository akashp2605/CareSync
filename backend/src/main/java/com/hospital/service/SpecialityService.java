package com.hospital.service;

import com.hospital.entity.Speciality;
import com.hospital.repository.SpecialityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpecialityService {

    @Autowired
    private SpecialityRepository specialityRepository;

    public Speciality add(Speciality s) {
        return specialityRepository.save(s);
    }

    public List<Speciality> getAll() {
        return specialityRepository.findAll();
    }

    public Speciality getById(Long id) {
        return specialityRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Speciality Not Found"));
    }

    public Speciality update(Long id, Speciality s) {
        Speciality ss=getById(id);
        ss.setName(s.getName());
        return specialityRepository.save(ss);
    }

    public String deleteById(Long id) {
        Speciality s=getById(id);
        specialityRepository.deleteById(id);
        return "Speciality deleted Successfully";
    }
}