package com.hospital.controller;

import com.hospital.entity.Doctor;
import com.hospital.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctor")
public class DoctorController {

    @Autowired
    private DoctorService service;

    @PostMapping("/add")
    public Doctor add(@RequestBody Doctor d){
        return service.add(d);
    }

    @GetMapping("/getall")
    public List<Doctor> getAll(){
        return service.getAll();
    }

    @GetMapping("get/{id}")
    public Doctor getById(@PathVariable Long id){
        return service.getById(id);
    }

    @PostMapping("/update/{id}")
    public Doctor update(@PathVariable Long id, @RequestBody Doctor d){
        return service.update(id,d);
    }
    
    @DeleteMapping("/delete/{id}")
    public String deleteById(@PathVariable Long id){
        return service.deleteById(id);
    }
}
