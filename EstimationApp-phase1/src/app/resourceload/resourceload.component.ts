import { Component, OnInit } from '@angular/core';
import { AllocationService } from '../service/allocation.service';
import { ApiService } from '../service/api.service';

@Component({
  selector: 'app-resourceload',
  templateUrl: './resourceload.component.html',
  styleUrls: ['./resourceload.component.scss']
})
export class ResourceloadComponent implements OnInit {
  newRow: any = this.getEmptyRow();
  savedRows: any[] = [];
  showEntryRow = false;
  RfpNum: number;
  skills: string[] = []; // To store skills for the dropdown

  constructor(private allocationService: AllocationService, private apiService: ApiService) {}
  ngOnInit(): void {
    this.RfpNum = this.apiService.getRfp();
    this.allocationService.fetchSkillsAndPhases(this.RfpNum).subscribe((skillsData: any) => {
      console.log('Received Skills Data:', skillsData); // Debugging log
 
      // If skillsData is an array of objects, convert it properly
      if (Array.isArray(skillsData)) {
        this.skills = skillsData.map(item => item.skills);
      } else if (skillsData.skills) {
        // Single object case
        this.skills = [skillsData.skills];
      } else {
        this.skills = [];
      }
 
      console.log('Skills Array:', this.skills); // Debugging log
    });
  }

  getEmptyRow() {
    return {
      deliveryLocation: '',
      level: 0,
      skill: '',
      total: 0,
      m1: 0,
      m2: 0,
      m3: 0,
      m4: 0,
      m5: 0,
      m6: 0,
      m7: 0,
      m8: 0,
      m9: 0,
      m10: 0,
      m11: 0,
      m12: 0
    };
  }

  updateTotal(row: any) {
    row.total = Math.round(
      row.m1 + row.m2 + row.m3 + row.m4 + row.m5 + row.m6 + row.m7 + row.m8 + row.m9 + row.m10 + row.m11 + row.m12
    );
  }

  addRow() {
    this.showEntryRow = true;
  }

  saveRow() {
    this.savedRows.push({ ...this.newRow, editing: false });
    this.newRow = this.getEmptyRow();
    this.showEntryRow = false;
  }

  cancelEntry() {
    this.newRow = this.getEmptyRow();
    this.showEntryRow = false;
  }

  editRow(row: any) {
    row.editing = true;
    row.original = { ...row };
  }

  saveEditedRow(row: any) {
    row.editing = false;
    delete row.original;
  }

  cancelEdit(row: any) {
    Object.assign(row, row.original);
    row.editing = false;
    delete row.original;
  }

  removeSavedRow(row: any) {
    this.savedRows = this.savedRows.filter(r => r !== row);
  }
}