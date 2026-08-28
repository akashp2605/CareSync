package com.hospital.controller;

import com.hospital.entity.Prescription;
import com.hospital.service.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prescription")
public class PrescriptionController {

    @Autowired
    private PrescriptionService service;

    @PostMapping("/add")
    public Prescription add(@RequestBody Prescription p){
        return service.add(p);
    }

    @GetMapping("/getall")
    public List<Prescription> getAll(){
        return service.getAll();
    }

    @GetMapping("/get/{id}")
    public Prescription getById(@PathVariable Long id){
        return service.getById(id);
    }

    @PostMapping("/update/{id}")
    public Prescription update(@PathVariable Long id, @RequestBody Prescription p){
        return service.update(id,p);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteById(@PathVariable Long id){
        return service.deleteById(id);
    }
}
