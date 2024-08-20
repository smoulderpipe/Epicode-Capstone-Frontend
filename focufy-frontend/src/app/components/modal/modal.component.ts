import { Component, Input, OnInit } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  @Input() isModalOpen: boolean = false;
  @Input() modalTitle: string = '';
  @Input() modalDescription: string = '';
  @Input() modalImage: string = '';

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.modalService.modalOpen$.subscribe(isOpen => this.isModalOpen = isOpen);
    this.modalService.modalData$.subscribe(data => {
      this.modalTitle = data.title;
      this.modalDescription = data.description;
      this.modalImage = data.image;
    });
  }

  closeModal() {
    this.modalService.closeModal();
  }
}