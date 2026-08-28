package com.hospital.controller;

import com.hospital.entity.Appointment;
import com.hospital.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointment")
public class AppointmentController {

    @Autowired
    private AppointmentService service;

    @PostMapping("/add")
    public Appointment add(@RequestBody Appointment a){
        return service.add(a);
    }

    @GetMapping("/getall")
    public List<Appointment> getAll(){
        return service.getAll();
    }

    @GetMapping("/get/{id}")
    public Appointment getById(@PathVariable Long id){
        return service.getById(id);
    }

    @PostMapping("/update/{id}")
    public Appointment update(@PathVariable Long id, @RequestBody Appointment a){
        return service.update(id,a);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteById(@PathVariable Long id){
        return service.deleteById(id);
    }
}
