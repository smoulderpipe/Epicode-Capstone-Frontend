import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalOpenSubject = new BehaviorSubject<boolean>(false);
  private modalDataSubject = new BehaviorSubject<{ title: string, description: string, image: string }>({
    title: '',
    description: '',
    image: ''
  });
  private modalClosedSubject = new BehaviorSubject<boolean>(false);

  modalOpen$ = this.modalOpenSubject.asObservable();
  modalData$ = this.modalDataSubject.asObservable();
  modalClosed$ = this.modalClosedSubject.asObservable();

  openModal(title: string, description: string, image: string) {
    this.modalOpenSubject.next(true);
    this.modalDataSubject.next({ title, description, image });
  }

  closeModal() {
    this.modalOpenSubject.next(false);
    this.modalClosedSubject.next(true);
  }
}