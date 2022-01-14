import { TestBed } from '@angular/core/testing';

import { LobbyService } from '../services/lobby.service';

describe('WebsocketService', () => {
  let service: LobbyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LobbyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
