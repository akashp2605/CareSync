package com.hospital.service;

import com.hospital.entity.Prescription;
import com.hospital.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    public Prescription add(Prescription p) {
        return prescriptionRepository.save(p);
    }

    public List<Prescription> getAll() {
        return prescriptionRepository.findAll();
    }

    public Prescription getById(Long id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Prescription Not Found"));
    }

    public Prescription update(Long id, Prescription p) {
        Prescription pp=getById(id);
        pp.setMedicine(p.getMedicine());
        pp.setDosage(p.getDosage());
        return prescriptionRepository.save(pp);
    }

    public String deleteById(Long id) {
        Prescription p=getById(id);
        prescriptionRepository.deleteById(id);
        return "Prescription deleted Successfully";
    }
}