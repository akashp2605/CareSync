package com.hospital.service;

import com.hospital.entity.Appointment;
import com.hospital.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public Appointment add(Appointment a) {
        return appointmentRepository.save(a);
    }

    public List<Appointment> getAll() {
        return appointmentRepository.findAll();
    }

    public Appointment getById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Appointment Not Found"));
    }

    public Appointment update(Long id, Appointment a) {
        Appointment aa=getById(id);
        aa.setAppointmentDate(a.getAppointmentDate());
        aa.setDoctor(a.getDoctor());
        aa.setPatient(a.getPatient());
        aa.setPrescription(a.getPrescription());
        return appointmentRepository.save(aa);
    }

    public String deleteById(Long id) {
        Appointment a=getById(id);
        appointmentRepository.deleteById(id);
        return "Appointment deleted Successfully";
    }
}
