import { Component, Injectable, inject } from '@angular/core';
import mockOrders from './mock-data';
import { NgStyle } from '@angular/common';
import { ClickOutsideDirective } from './click-outside.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddOrderModalComponent } from '../modals/add-order-modal/add-order-modal.component';
import { ViewOrderModalComponent } from '../modals/view-order-modal/view-order-modal.component';
import { ResponsableOrderModalComponent } from '../modals/responsable-order-modal/responsable-order-modal.component';
import { FinishOrderModalComponent } from '../modals/finish-order-modal/finish-order-modal.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import baseUrl from '../../../baseUrl';

@Component({
  selector: 'app-order-table',
  standalone: true,
  imports: [
    NgStyle, 
    ClickOutsideDirective,
    AddOrderModalComponent, 
    ViewOrderModalComponent, 
    ResponsableOrderModalComponent,
    FinishOrderModalComponent,
    HttpClientModule 
  ],
  templateUrl: './order-table.component.html',
  styleUrl: './order-table.component.css'
})
export class OrderTableComponent {
  constructor(private modalService: NgbModal) { }
  
  orders: any[] = [];
  
  private httpClient = inject(HttpClient);
  
  ngOnInit() {
    this.closeContextMenu();

    this.httpClient.get(`${baseUrl}/api/orders`).subscribe((data: any) => {
      this.orders = data.data;
    });
  }

  public open(modal: any): void {
    this.modalService.open(modal, { centered: true, animation: false });
  }

  public close(modal: any): void {
    this.modalService.dismissAll(modal);
  }

  // Equipamento(TV, Celular, Desktop, Monitor, Notebook), Início, Previsão de  entrega, Problema apresentado, Funcionário responsável, Status.
  
  getInProcessOrders() {
    return this.orders.length > 0 ? this.orders.filter(order => order.status === 'Em andamento') : [];
  }

  getFinishedOrders() {
    return this.orders.length > 0 ? this.orders.filter(order => order.status === 'Finalizado') : [];
  }

  selectedRowIds: Set<string> = new Set<string>();
  selectedOrders: any;
  selectedId: string = '';

  onRowClick(id: string) {
    console.log(this.selectedOrders);
    if (this.selectedRowIds.has(id)) {
      this.selectedRowIds.delete(id);
    }
    else {
      this.selectedRowIds.add(id);
    }
  }

  rowIsSelected(id: string) {
    this.selectedOrders = JSON.stringify(this.orders.filter(x => this.selectedRowIds.has(x.id)));
    return this.selectedRowIds.has(id);
  }

  getSelectedRows() {
    return this.orders.filter(x => this.selectedRowIds.has(x.id));
  }

  // CONTEXT MENU CODE

  rightPanelStyle: any = {}
  currentOrder: any = {};


  detectRightMouseClick($event: any, order: any) {
    if ($event.which === 3) {
      this.rightPanelStyle = {
        'display': 'block',
        'position': 'absolute',
        'left.px': ($event.clientX),
        'top.px': ($event.clientY)
      };
      this.currentOrder = JSON.stringify(order);
    }
  }

  closeContextMenu() {
    this.rightPanelStyle = {
      'display': 'none'
    };
  }

  onOrderView(orderView: any) {
    this.open(orderView);
  }

  onOrderChangeResponsable(responsableOrder: any) {
    this.open(responsableOrder);
  }
  
  onOrderFinish(finishOrder: any) {
    this.open(finishOrder);
  }

  onOrderDelete() {
    let currentOrder = JSON.parse(this.currentOrder);
    if(this.selectedRowIds.size > 0) {
      this.selectedRowIds.forEach(selected => {
        this.orders = this.orders.filter(order => order.id !== selected);

        this.httpClient.delete(`${baseUrl}/api/orders/${selected}`).subscribe((data: any) => {
          console.log(data.status);
          if (data.status === 200) {
            console.log('Ordem deletada com sucesso!');
          } else {
            console.log('Erro ao deletar ordem!');
          }
        });

        this.closeContextMenu();
      });
    } else {
      this.orders = this.orders.filter(x => x.id !== currentOrder.id); 

      this.httpClient.delete(`${baseUrl}/api/orders/${currentOrder.id}`).subscribe((data: any) => {
        console.log(data.status);
        if (data.status === 200) {
          console.log('Ordem deletada com sucesso!');
        } else {
          console.log('Erro ao deletar ordem!');
        }
      });

      this.closeContextMenu();
    }
    this.selectedRowIds.clear();
  }

  onCancel(modal: any) {
    this.close(modal);
    this.closeContextMenu();
  }
}
