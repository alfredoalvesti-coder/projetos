import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Barbeiro {
  nome: string;
  especialidade: string;
  bio: string;
}

@Component({
  selector: 'app-barbeiros',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './barbeiros.component.html',
  styleUrl: './barbeiros.component.scss'
})
export class BarbeirosComponent {
  readonly barbeiros: Barbeiro[] = [
    {
      nome: 'Carlos Singer',
      especialidade: 'Cortes clássicos',
      bio: 'Fundador da casa. Especialista em fade e acabamento preciso.'
    },
    {
      nome: 'Rafael Lima',
      especialidade: 'Barba e bigode',
      bio: 'Detalhista na modelagem e nos rituais de toalha quente.'
    },
    {
      nome: 'Diego Alves',
      especialidade: 'Estilos modernos',
      bio: 'Atualizado nas tendências e no visual criativo.'
    }
  ];
}
