package com.hospital.controller;

import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.print.Doc;
import java.util.List;

@RestController
@RequestMapping("/patient")
public class PatientController {

    @Autowired
    private PatientService service;

    @PostMapping("/add")
    public Patient add(@RequestBody Patient p){
        return service.add(p);
    }

    @GetMapping("/getall")
    public List<Patient> getALl(){
        return service.getAll();
    }

    @GetMapping("/get/{id}")
    public Patient getById(@PathVariable Long id){
        return  service.getById(id);
    }

    @PostMapping("/update/{id}")
    public Patient update(@PathVariable Long id, @RequestBody Patient p){
        return service.update(id,p);
    }

    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable Long id){
        return service.deleteById(id);
    }
}
