import log from "../config/logger";
import get_client from "../loaders/database";
import { employee_get_binds, Employee } from "../interface/interface";
import moment from "moment";
import config from "../config/config";
import { Client } from "pg";

export async function employee_sur_create(bind: any) {
    let client;
    try {
      client = get_client();
      await client.connect();
      let ageStatus = false
      if(bind.employee.birth_date){
        const birthDate = new Date(bind.employee.birth_date);
        const currentDate = new Date();

        let age = currentDate.getFullYear() - birthDate.getFullYear();

        if (
            currentDate.getMonth() < birthDate.getMonth() ||
            (currentDate.getMonth() === birthDate.getMonth() &&
              currentDate.getDate() < birthDate.getDate())
          ) {
            age--;
          }
        if(age<=25){
            ageStatus= true
        }
      }
      let gpa = 0
      let gpaStatus = false
      for(const education of bind.employee.educations){
        gpa = gpa + education.gpi; 
      }
      gpa = gpa/bind.employee.educations.length
      if(gpa >= 3){
        gpaStatus = true
      }
      let animalStatus = true
      let crimeStatus = true
      for(const crime of bind.employee.crimes){
        if(crime.crime_status == true && crime.crime_id != 6){
            crimeStatus = false
        }

        if(crime.crime_id == 6  && crime.crime_status == true){
            animalStatus = false
        }
      }
      let achievementStatus = false
      for(const certificate of bind.employee.certificates){
        if(certificate.name){
            achievementStatus = true
        }
      }
      for(const achievement of bind.employee.achievements){
        if(achievement.name){
            achievementStatus = true
        }
      }
      
      let gapYear = true
      let educationEndDate
      if(bind.employee.educations[0].date_to){
        educationEndDate = new Date(bind.employee.educations[0].date_to)
      }
      let workStartDate
      if(bind.employee.worklist[0].date_from){
        workStartDate = new Date(bind.employee.educations[0].date_from)
      }
      if (educationEndDate && workStartDate) {
        const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25; // Account for leap years
        const differenceInMilliseconds = educationEndDate.getTime() - workStartDate.getTime();
        const gapInYears = differenceInMilliseconds / millisecondsInYear;
    
        // Check if there is a gap of at least 1 year
        if(gapInYears >= 1){
            gapYear = false 
        }
    }
    let Answers = []
    Answers.push(true,gapYear,gpaStatus,crimeStatus,achievementStatus,ageStatus,animalStatus)
      for(let i=1; i < 7; i++){
        await client.query(`
          insert into hr.employee_sur_rel
              (employee_id, sur_id,status)
          values 
              ('${bind.employee.id}', '${i}', '${Answers[i]}')
          returning *;`);
      }
      return true;
    } catch (err) {
      log.error(err);
      throw err;
    } finally {
      if (client) {
        await client.end();
      }
    }
  }