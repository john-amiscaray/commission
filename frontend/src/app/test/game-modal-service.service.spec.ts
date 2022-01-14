import { TestBed } from '@angular/core/testing';

import { GameMessageService } from '../services/game-message.service';

describe('GameModalServiceService', () => {
  let service: GameMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
