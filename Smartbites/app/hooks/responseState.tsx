import { Subject } from 'rxjs';

type MessageUpdate = { id: number; text: string };

class ResponseState {
  private _responseInterval: NodeJS.Timeout | null = null;
  private _fullResponse: string = "";
  private _currentIndex: number = 0;
  private _thinkingMessageId: number | null = null;
  private _isResponding: boolean = false;
  public readonly messageUpdated = new Subject<MessageUpdate>();
  abortController: any;

  get responseInterval(): NodeJS.Timeout | null {
    return this._responseInterval;
  }

  get fullResponse(): string {
    return this._fullResponse;
  }

  set fullResponse(value: string) {
    this._fullResponse = value;
  }

  get currentIndex(): number {
    return this._currentIndex;
  }

  set currentIndex(value: number) {
    this._currentIndex = value;
  }

  get thinkingMessageId(): number | null {
    return this._thinkingMessageId;
  }

  set thinkingMessageId(value: number | null) {
    this._thinkingMessageId = value;
  }

  get isResponding(): boolean {
    return this._isResponding;
  }

  set isResponding(value: boolean) {
    this._isResponding = value;
    if (!value) {
      this.messageUpdated.next({
        id: this._thinkingMessageId!,
        text: this._fullResponse
      });
    }
  }

  startResponseAnimation(p0: number): void {
    this.stopResponseAnimation();

    if (this._currentIndex >= this._fullResponse.length) {
      this._currentIndex = 0;
    }

    this._isResponding = true;
    this._responseInterval = setInterval(() => {
      if (this._currentIndex < this._fullResponse.length) {
        const currentText = this._fullResponse.substring(0, this._currentIndex + 1);
        this._currentIndex++;
        this.messageUpdated.next({
          id: this._thinkingMessageId!,
          text: currentText
        });
      } else {
        this.stopResponseAnimation();
        this.messageUpdated.next({
          id: this._thinkingMessageId!,
          text: this._fullResponse
        });
      }
    }, 30);
  }

  stopResponseAnimation(): void {
    if (this._responseInterval) {
      clearInterval(this._responseInterval);
      this._responseInterval = null;
    }
    this._isResponding = false;
  }

  resetResponseState(): void {
    this.stopResponseAnimation();
    this._fullResponse = "";
    this._currentIndex = 0;
    this._thinkingMessageId = null;
  }

  complete(): void {
    this.stopResponseAnimation();
    this.messageUpdated.complete();
  }
}

export const globalResponseState = new ResponseState();

export const cleanupResponseState = () => {
  globalResponseState.complete();
};