import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../service/api.service';
import { MetricsService } from '../service/metrics.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AllocationService } from '../service/allocation.service';

@Component({
  selector: 'app-allocation',
  templateUrl: './allocation.component.html',
  styleUrls: ['./allocation.component.scss']
})
export class AllocationComponent implements OnInit {
  Skillset: string[] = [];
  newSkills: string = '';
  editedSkill: string = '';
  RfpNum: number;
  metricsData: any[] = [];
  uniqueHeader: string[] = [];
  selectedPhase: string;
  searchPhase: string = '';
  showSavedMessage: boolean = false;
  phaseSkillsets: { [key: string]: string[] } = {};
  skillsetOptions: string[] = [];
  addSkillPhase: string;
  editSkillPhase: string;
  deleteSkillPhase: string;
  selectedSkill: string;
  selectedSkillToDelete: string;
  showAddSkillBox: boolean = false;
  showEditSkillBox: boolean = false;
  showDeleteSkillBox: boolean = false;

  public Object = Object;

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private metricService: MetricsService,
    private snackBar: MatSnackBar,
    private allocationService: AllocationService
  ) {}

  ngOnInit(): void {
    this.RfpNum = this.apiService.getRfp();
    this.fetchData();
    this.fetchSkillsFromBackend();
  }

  fetchData() {
    this.metricService.fetchDictionaryData(this.RfpNum).subscribe(
      (data: any) => {
        this.metricsData = data;
        const referenceIndexArray = this.metricsData.map((item: { phase: { S: any } }) => item.phase.S);
        this.uniqueHeader = [...new Set(referenceIndexArray)];
        console.log('Unique Header:', this.uniqueHeader);
      },
      error => {
        console.error('Error fetching dictionary data:', error);
        this.snackBar.open('Error fetching phase data. Please try again later.', 'Close', { duration: 3000 });
      }
    );
  }

  fetchSkillsFromBackend() {
  this.allocationService.fetchSkillsAndPhases(this.RfpNum).subscribe(
    (data: any[]) => {
      this.phaseSkillsets = data.reduce((acc: { [key: string]: string[] }, item: any) => {
        if (!acc[item.phases]) {
          acc[item.phases] = [];
        }
        // Split skills by comma and trim each skill, then push each to the array
        const skillsArray = item.skills.split(',').map((skill: string) => skill.trim());
        acc[item.phases].push(...skillsArray);
        return acc;
      }, {});
      this.updateSkillsetOptions();
      console.log('Phase Skillsets:', this.phaseSkillsets);
    },
    error => {
      console.error('Error fetching skills from backend:', error);
      this.snackBar.open('Error fetching skills data. Please try again later.', 'Close', { duration: 3000 });
    }
  );
}

  
  
  

  updateSkillsetOptions() {
    this.skillsetOptions = this.selectedPhase ? this.phaseSkillsets[this.selectedPhase] || [] : [];
  }

  onSubmit() {
    if (!this.selectedPhase || this.Skillset.length === 0) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 2000 });
      return;
    }

    const formData = {
      phases: this.selectedPhase,
      skills: this.Skillset.join(','),
      rfp_no: this.RfpNum
    };

    this.allocationService.dataPostApi(formData).subscribe(
      response => {
        this.showSavedMessage = true;
        this.snackBar.open('Form Submitted Successfully', 'Close', { duration: 2000 });
        setTimeout(() => {
          this.showSavedMessage = false;
        }, 3000);
        this.fetchSkillsFromBackend();
      },
      error => {
        console.error('Error submitting form:', error);
        this.snackBar.open('Error submitting form. Please try again later.', 'Close', { duration: 3000 });
      }
    );
  }

  addSkills() {
    if (this.newSkills && this.addSkillPhase) {
      const skillsToAdd = this.newSkills.split(',').map(skill => skill.trim()).filter(skill => skill);
      const formData = {
        phases: this.addSkillPhase,
        skills: skillsToAdd.join(','), // Sending the new skills as a comma-separated string
        rfp_no: this.RfpNum
      };

      this.allocationService.dataPostApi(formData).subscribe(
        response => {
          this.snackBar.open('Skills added and saved successfully', 'Close', { duration: 2000 });
          this.newSkills = '';
          this.fetchSkillsFromBackend();
        },
        error => {
          console.error('Error adding and saving skills:', error);
          this.snackBar.open('Error adding and saving skills. Please try again later.', 'Close', { duration: 3000 });
        }
      );
    }
  }

  editSkill() {
    if (this.selectedSkill && this.editedSkill && this.editSkillPhase) {
      const formData = {
        phases: this.editSkillPhase,
        skills: this.editedSkill,
        rfp_no: this.RfpNum
      };

      this.allocationService.dataPostApi(formData).subscribe(
        response => {
          this.snackBar.open('Skill edited successfully', 'Close', { duration: 2000 });
          this.editedSkill = '';
          this.selectedSkill = '';
          this.fetchSkillsFromBackend();
        },
        error => {
          console.error('Error editing skill:', error);
          this.snackBar.open('Error editing skill. Please try again later.', 'Close', { duration: 3000 });
        }
      );
    }
  }

  deleteSkill() {
    if (this.selectedSkillToDelete && this.deleteSkillPhase) {
      const formData = {
        phases: this.deleteSkillPhase,
        skills: this.selectedSkillToDelete,
        rfp_no: this.RfpNum
      };

      this.allocationService.dataPostApi(formData).subscribe(
        response => {
          this.snackBar.open('Skill deleted successfully', 'Close', { duration: 2000 });
          this.selectedSkillToDelete = '';
          this.fetchSkillsFromBackend();
        },
        error => {
          console.error('Error deleting skill:', error);
          this.snackBar.open('Error deleting skill. Please try again later.', 'Close', { duration: 3000 });
        }
      );
    }
  }

  toggleAddSkill() {
    this.showAddSkillBox = !this.showAddSkillBox;
    this.showEditSkillBox = false;
    this.showDeleteSkillBox = false;
  }

  toggleEditSkill() {
    this.showEditSkillBox = !this.showEditSkillBox;
    this.showAddSkillBox = false;
    this.showDeleteSkillBox = false;
  }

  toggleDeleteSkill() {
    this.showDeleteSkillBox = !this.showDeleteSkillBox;
    this.showAddSkillBox = false;
    this.showEditSkillBox = false;
  }

  onPhaseChange() {
    this.updateSkillsetOptions();
  }
}