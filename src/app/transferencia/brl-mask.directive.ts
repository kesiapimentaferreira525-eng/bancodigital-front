import { Directive, ElementRef, HostListener, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Máscara BRL: o usuário digita números e o valor é exibido como R$ 1.234,56. O controle recebe number. */
@Directive({
  selector: 'input[brlMask]', standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BrlMaskDirective), multi: true }],
})
export class BrlMaskDirective implements ControlValueAccessor {
  private el = inject(ElementRef<HTMLInputElement>);
  private fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  private onChange: (v: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  @HostListener('input', ['$event.target.value'])
  onInput(raw: string) {
    const digits = raw.replace(/\D/g, '');
    const valor = digits ? Number(digits) / 100 : null;
    this.el.nativeElement.value = valor === null ? '' : this.fmt.format(valor);
    this.onChange(valor);
  }
  @HostListener('blur') onBlur() { this.onTouched(); }
  writeValue(v: number | null) { this.el.nativeElement.value = v == null ? '' : this.fmt.format(v); }
  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }
  setDisabledState(d: boolean) { this.el.nativeElement.disabled = d; }
}
