---
skill: component-creation
version: 1.0.0
framework: go
category: ui
triggers:
  - "component creation"
  - "Go components"
  - "Go patterns"
  - "component architecture"
author: "@nexus-framework/skills"
status: active
---

# Skill: Component Creation (Go)

## When to Read This
Read this skill when creating new Go components, designing component architecture, or establishing component patterns in a Go application.

## Context
This project follows Go's idiomatic patterns with a focus on simplicity, composition, and clear interfaces. We use Go's built-in features like structs, interfaces, and composition. Components are designed to be modular, testable, and maintainable with proper separation of concerns and clear interfaces. We follow Go's philosophy of "less is more" with clean, readable code.

## Steps
1. Define component purpose and responsibilities
2. Create proper struct definitions with clear fields
3. Implement component with proper encapsulation and methods
4. Add proper error handling and validation
5. Implement proper composition and embedding patterns
6. Add proper documentation and examples
7. Write comprehensive tests for the component
8. Document component usage and interfaces

## Patterns We Use
- Structs: Use proper struct definitions with clear fields
- Interfaces: Use interfaces for abstraction and dependency injection
- Composition: Use composition over inheritance
- Error handling: Use Go's error handling patterns with custom errors
- Documentation: Use godoc comments and examples
- Testing: Use Go's built-in testing package
- Concurrency: Use goroutines and channels where appropriate
- Dependency injection: Use constructor functions and interfaces

## Anti-Patterns — Never Do This
- ❌ Do not create overly complex structs with too many responsibilities
- ❌ Do not ignore error handling
- ❌ Do not hardcode values in components
- ❌ Do not create components that are too tightly coupled
- ❌ Do not ignore Go's naming conventions
- ❌ Do not forget to write tests for your components
- ❌ Do not ignore Go's "less is more" philosophy
- ❌ Do not create unnecessary abstractions

## Example

```go
// components/button.go
package components

import (
	"errors"
	"fmt"
	"strings"
)

// ButtonVariant represents the visual variant of a button
type ButtonVariant string

const (
	ButtonPrimary   ButtonVariant = "primary"
	ButtonSecondary ButtonVariant = "secondary"
	ButtonGhost     ButtonVariant = "ghost"
	ButtonDanger    ButtonVariant = "danger"
)

// ButtonSize represents the size of a button
type ButtonSize string

const (
	ButtonSmall  ButtonSize = "small"
	ButtonMedium ButtonSize = "medium"
	ButtonLarge  ButtonSize = "large"
)

// ButtonState represents the current state of a button
type ButtonState string

const (
	ButtonNormal   ButtonState = "normal"
	ButtonHover    ButtonState = "hover"
	ButtonPressed  ButtonState = "pressed"
	ButtonDisabled ButtonState = "disabled"
)

// ButtonError represents an error related to button operations
type ButtonError struct {
	Message string
	Err     error
}

func (e *ButtonError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("button error: %s: %v", e.Message, e.Err)
	}
	return fmt.Sprintf("button error: %s", e.Message)
}

// ButtonStyle represents the visual style of a button
type ButtonStyle struct {
	BackgroundColor string
	TextColor       string
	BorderColor     string
	BorderRadius    int
	Padding         [2]int // [vertical, horizontal]
	FontSize        int
	FontWeight      string
}

// Default styles for different button variants
func defaultButtonStyle(variant ButtonVariant) ButtonStyle {
	switch variant {
	case ButtonPrimary:
		return ButtonStyle{
			BackgroundColor: "#007bff",
			TextColor:       "#ffffff",
			BorderColor:     "#007bff",
			BorderRadius:    4,
			Padding:         [2]int{8, 16},
			FontSize:        14,
			FontWeight:      "normal",
		}
	case ButtonSecondary:
		return ButtonStyle{
			BackgroundColor: "#6c757d",
			TextColor:       "#ffffff",
			BorderColor:     "#6c757d",
			BorderRadius:    4,
			Padding:         [2]int{8, 16},
			FontSize:        14,
			FontWeight:      "normal",
		}
	case ButtonGhost:
		return ButtonStyle{
			BackgroundColor: "transparent",
			TextColor:       "#212529",
			BorderColor:     "transparent",
			BorderRadius:    4,
			Padding:         [2]int{8, 16},
			FontSize:        14,
			FontWeight:      "normal",
		}
	case ButtonDanger:
		return ButtonStyle{
			BackgroundColor: "#dc3545",
			TextColor:       "#ffffff",
			BorderColor:     "#dc3545",
			BorderRadius:    4,
			Padding:         [2]int{8, 16},
			FontSize:        14,
			FontWeight:      "normal",
		}
	default:
		return defaultButtonStyle(ButtonPrimary)
	}
}

// ButtonClickHandler defines the signature for button click handlers
type ButtonClickHandler func() error

// Button represents a reusable button component
type Button struct {
	text     string
	variant  ButtonVariant
	size     ButtonSize
	onClick  ButtonClickHandler
	style    ButtonStyle
	enabled  bool
	tooltip  string
	state    ButtonState
}

// NewButton creates a new button with the given text
func NewButton(text string) (*Button, error) {
	if strings.TrimSpace(text) == "" {
		return nil, &ButtonError{Message: "button text cannot be empty"}
	}

	return &Button{
		text:    strings.TrimSpace(text),
		variant: ButtonPrimary,
		size:    ButtonMedium,
		enabled: true,
		state:   ButtonNormal,
		style:   defaultButtonStyle(ButtonPrimary),
	}, nil
}

// SetText sets the button text
func (b *Button) SetText(text string) error {
	if strings.TrimSpace(text) == "" {
		return &ButtonError{Message: "button text cannot be empty"}
	}
	b.text = strings.TrimSpace(text)
	return nil
}

// Text returns the button text
func (b *Button) Text() string {
	return b.text
}

// SetVariant sets the button variant
func (b *Button) SetVariant(variant ButtonVariant) {
	b.variant = variant
	b.style = defaultButtonStyle(variant)
}

// Variant returns the button variant
func (b *Button) Variant() ButtonVariant {
	return b.variant
}

// SetSize sets the button size
func (b *Button) SetSize(size ButtonSize) {
	b.size = size
}

// Size returns the button size
func (b *Button) Size() ButtonSize {
	return b.size
}

// SetOnClick sets the click handler
func (b *Button) SetOnClick(handler ButtonClickHandler) {
	b.onClick = handler
}

// SetEnabled enables or disables the button
func (b *Button) SetEnabled(enabled bool) {
	b.enabled = enabled
	if !enabled {
		b.state = ButtonDisabled
	} else if b.state == ButtonDisabled {
		b.state = ButtonNormal
	}
}

// Enabled returns whether the button is enabled
func (b *Button) Enabled() bool {
	return b.enabled
}

// SetTooltip sets the button tooltip
func (b *Button) SetTooltip(tooltip string) {
	b.tooltip = tooltip
}

// Tooltip returns the button tooltip
func (b *Button) Tooltip() string {
	return b.tooltip
}

// Render renders the button as HTML
func (b *Button) Render() string {
	disabledAttr := ""
	if !b.enabled {
		disabledAttr = " disabled"
	}
	
	tooltipAttr := ""
	if b.tooltip != "" {
		tooltipAttr = fmt.Sprintf(` title="%s"`, b.tooltip)
	}

	return fmt.Sprintf(
		`<button class="btn btn-%s btn-%s"%s%s style="%s">%s</button>`,
		b.variant, b.size, disabledAttr, tooltipAttr, b.cssStyle(), b.text,
	)
}

// cssStyle generates the CSS style string for the button
func (b *Button) cssStyle() string {
	padding := fmt.Sprintf("%dpx %dpx", b.style.Padding[0], b.style.Padding[1])
	
	return fmt.Sprintf(
		"background-color: %s; "+
			"color: %s; "+
			"border-color: %s; "+
			"border-radius: %dpx; "+
			"padding: %s; "+
			"font-size: %dpx; "+
			"font-weight: %s;",
		b.style.BackgroundColor, b.style.TextColor, b.style.BorderColor,
		b.style.BorderRadius, padding, b.style.FontSize, b.style.FontWeight,
	)
}

// Click handles the button click event
func (b *Button) Click() error {
	if !b.enabled {
		return &ButtonError{Message: "cannot click disabled button"}
	}

	b.state = ButtonPressed
	defer func() { b.state = ButtonNormal }()

	if b.onClick != nil {
		if err := b.onClick(); err != nil {
			return &ButtonError{Message: "click handler failed", Err: err}
		}
	}

	return nil
}

// Hover handles the mouse hover event
func (b *Button) Hover() {
	if b.enabled {
		b.state = ButtonHover
	}
}

// Leave handles the mouse leave event
func (b *Button) Leave() {
	if b.enabled {
		b.state = ButtonNormal
	}
}

// State returns the current button state
func (b *Button) State() ButtonState {
	return b.state
}

// String returns a string representation of the button
func (b *Button) String() string {
	return fmt.Sprintf("Button('%s', %s, %s)", b.text, b.variant, b.size)
}

// ButtonGroup represents a group of related buttons
type ButtonGroup struct {
	buttons []*Button
}

// NewButtonGroup creates a new button group
func NewButtonGroup() *ButtonGroup {
	return &ButtonGroup{
		buttons: make([]*Button, 0),
	}
}

// AddButton adds a button to the group
func (bg *ButtonGroup) AddButton(button *Button) error {
	if button == nil {
		return errors.New("cannot add nil button to group")
	}
	bg.buttons = append(bg.buttons, button)
	return nil
}

// RemoveButton removes a button from the group
func (bg *ButtonGroup) RemoveButton(button *Button) {
	for i, b := range bg.buttons {
		if b == button {
			bg.buttons = append(bg.buttons[:i], bg.buttons[i+1:]...)
			break
		}
	}
}

// EnableAll enables all buttons in the group
func (bg *ButtonGroup) EnableAll() {
	for _, button := range bg.buttons {
		button.SetEnabled(true)
	}
}

// DisableAll disables all buttons in the group
func (bg *ButtonGroup) DisableAll() {
	for _, button := range bg.buttons {
		button.SetEnabled(false)
	}
}

// Render renders all buttons as a group
func (bg *ButtonGroup) Render() string {
	buttonHTML := ""
	for _, button := range bg.buttons {
		buttonHTML += button.Render()
	}
	return fmt.Sprintf(`<div class="btn-group">%s</div>`, buttonHTML)
}

// Buttons returns all buttons in the group
func (bg *ButtonGroup) Buttons() []*Button {
	return bg.buttons
}

// Len returns the number of buttons in the group
func (bg *ButtonGroup) Len() int {
	return len(bg.buttons)
}
```

```go
// components/card.go
package components

import (
	"encoding/json"
	"fmt"
	"strings"
)

// CardVariant represents the visual variant of a card
type CardVariant string

const (
	CardDefault  CardVariant = "default"
	CardElevated CardVariant = "elevated"
	CardOutlined CardVariant = "outlined"
)

// CardSize represents the size of a card
type CardSize string

const (
	CardSmall  CardSize = "small"
	CardMedium CardSize = "medium"
	CardLarge  CardSize = "large"
)

// CardError represents an error related to card operations
type CardError struct {
	Message string
	Err     error
}

func (e *CardError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("card error: %s: %v", e.Message, e.Err)
	}
	return fmt.Sprintf("card error: %s", e.Message)
}

// CardStyle represents the visual style of a card
type CardStyle struct {
	BackgroundColor string
	BorderColor     string
	BorderRadius    int
	BoxShadow       string
	Padding         [2]int // [vertical, horizontal]
	Margin          [2]int // [vertical, horizontal]
}

// Default styles for different card variants
func defaultCardStyle(variant CardVariant) CardStyle {
	switch variant {
	case CardDefault:
		return CardStyle{
			BackgroundColor: "#ffffff",
			BorderColor:     "#e9ecef",
			BorderRadius:    8,
			BoxShadow:       "0 2px 4px rgba(0,0,0,0.1)",
			Padding:         [2]int{16, 16},
			Margin:          [2]int{0, 0},
		}
	case CardElevated:
		return CardStyle{
			BackgroundColor: "#ffffff",
			BorderColor:     "#e9ecef",
			BorderRadius:    8,
			BoxShadow:       "0 4px 8px rgba(0,0,0,0.15)",
			Padding:         [2]int{16, 16},
			Margin:          [2]int{0, 0},
		}
	case CardOutlined:
		return CardStyle{
			BackgroundColor: "#ffffff",
			BorderColor:     "#dee2e6",
			BorderRadius:    8,
			BoxShadow:       "none",
			Padding:         [2]int{16, 16},
			Margin:          [2]int{0, 0},
		}
	default:
		return defaultCardStyle(CardDefault)
	}
}

// Card represents a reusable card component
type Card struct {
	title       string
	content     string
	variant     CardVariant
	size        CardSize
	style       CardStyle
	collapsible bool
	collapsed   bool
}

// NewCard creates a new card with the given content
func NewCard(content string) (*Card, error) {
	return &Card{
		content:     content,
		variant:     CardDefault,
		size:        CardMedium,
		collapsible: false,
		collapsed:   false,
		style:       defaultCardStyle(CardDefault),
	}, nil
}

// SetTitle sets the card title
func (c *Card) SetTitle(title string) error {
	if title != "" && strings.TrimSpace(title) == "" {
		return &CardError{Message: "card title cannot be empty"}
	}
	c.title = strings.TrimSpace(title)
	return nil
}

// Title returns the card title
func (c *Card) Title() string {
	return c.title
}

// SetContent sets the card content
func (c *Card) SetContent(content string) {
	c.content = content
}

// Content returns the card content
func (c *Card) Content() string {
	return c.content
}

// SetVariant sets the card variant
func (c *Card) SetVariant(variant CardVariant) {
	c.variant = variant
	c.style = defaultCardStyle(variant)
}

// Variant returns the card variant
func (c *Card) Variant() CardVariant {
	return c.variant
}

// SetSize sets the card size
func (c *Card) SetSize(size CardSize) {
	c.size = size
}

// Size returns the card size
func (c *Card) Size() CardSize {
	return c.size
}

// SetCollapsible sets whether the card is collapsible
func (c *Card) SetCollapsible(collapsible bool) {
	c.collapsible = collapsible
	if !collapsible {
		c.collapsed = false
	}
}

// Collapsible returns whether the card is collapsible
func (c *Card) Collapsible() bool {
	return c.collapsible
}

// SetCollapsed sets whether the card is collapsed
func (c *Card) SetCollapsed(collapsed bool) error {
	if !c.collapsible {
		return &CardError{Message: "cannot collapse a non-collapsible card"}
	}
	c.collapsed = collapsed
	return nil
}

// Collapsed returns whether the card is collapsed
func (c *Card) Collapsed() bool {
	return c.collapsed
}

// Toggle toggles the collapsed state
func (c *Card) Toggle() error {
	if !c.collapsible {
		return &CardError{Message: "cannot toggle a non-collapsible card"}
	}
	c.collapsed = !c.collapsed
	return nil
}

// Render renders the card as HTML
func (c *Card) Render() string {
	cssClass := fmt.Sprintf("card card-%s card-%s", c.variant, c.size)
	styleAttr := fmt.Sprintf(` style="%s"`, c.cssStyle())

	headerHTML := ""
	if c.title != "" {
		collapseButton := ""
		if c.collapsible {
			collapseIcon := "▼"
			if c.collapsed {
				collapseIcon = "▲"
			}
			collapseButton = fmt.Sprintf(
				`<button class="card-collapse-btn" onclick="toggleCard(this)"> %s</button>`,
				collapseIcon,
			)
		}

		headerHTML = fmt.Sprintf(
			`<div class="card-header"><h3 class="card-title">%s</h3>%s</div>`,
			c.title, collapseButton,
		)
	}

	contentClass := "card-content"
	if c.collapsed {
		contentClass += " card-collapsed"
	}
	contentHTML := fmt.Sprintf(`<div class="%s">%s</div>`, contentClass, c.content)

	return fmt.Sprintf(`<div class="%s"%s>%s%s</div>`, cssClass, styleAttr, headerHTML, contentHTML)
}

// cssStyle generates the CSS style string for the card
func (c *Card) cssStyle() string {
	padding := fmt.Sprintf("%dpx %dpx", c.style.Padding[0], c.style.Padding[1])
	margin := fmt.Sprintf("%dpx %dpx", c.style.Margin[0], c.style.Margin[1])

	return fmt.Sprintf(
		"background-color: %s; "+
			"border: 1px solid %s; "+
			"border-radius: %dpx; "+
			"box-shadow: %s; "+
			"padding: %s; "+
			"margin: %s;",
		c.style.BackgroundColor, c.style.BorderColor, c.style.BorderRadius,
		c.style.BoxShadow, padding, margin,
	)
}

// Serialize serializes the card to a map
func (c *Card) Serialize() map[string]interface{} {
	return map[string]interface{}{
		"title":       c.title,
		"content":     c.content,
		"variant":     string(c.variant),
		"size":        string(c.size),
		"collapsible": c.collapsible,
		"collapsed":   c.collapsed,
	}
}

// ToJSON serializes the card to JSON
func (c *Card) ToJSON() ([]byte, error) {
	return json.MarshalIndent(c.Serialize(), "", "  ")
}

// String returns a string representation of the card
func (c *Card) String() string {
	titleStr := c.title
	if titleStr == "" {
		titleStr = "No title"
	}
	return fmt.Sprintf("Card('%s', %s, %s)", titleStr, c.variant, c.size)
}
```

```go
// components/form.go
package components

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
)

// InputType represents the type of an input field
type InputType string

const (
	InputText    InputType = "text"
	InputEmail   InputType = "email"
	InputPassword InputType = "password"
	InputNumber  InputType = "number"
	InputTel     InputType = "tel"
	InputURL     InputType = "url"
)

// InputError represents an error related to input operations
type InputError struct {
	Message string
	Err     error
}

func (e *InputError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("input error: %s: %v", e.Message, e.Err)
	}
	return fmt.Sprintf("input error: %s", e.Message)
}

// ValidationError represents a validation error
type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("validation error in field '%s': %s", e.Field, e.Message)
}

// Validator defines the interface for input validators
type Validator interface {
	Validate(value string) error
}

// RequiredValidator validates that a field is not empty
type RequiredValidator struct {
	Message string
}

// NewRequiredValidator creates a new required validator
func NewRequiredValidator(message string) *RequiredValidator {
	if message == "" {
		message = "This field is required"
	}
	return &RequiredValidator{Message: message}
}

// Validate implements the Validator interface
func (v *RequiredValidator) Validate(value string) error {
	if strings.TrimSpace(value) == "" {
		return &ValidationError{
			Field:   "required",
			Message: v.Message,
		}
	}
	return nil
}

// EmailValidator validates that a field contains a valid email
type EmailValidator struct {
	Message string
	pattern *regexp.Regexp
}

// NewEmailValidator creates a new email validator
func NewEmailValidator(message string) *EmailValidator {
	if message == "" {
		message = "Please enter a valid email address"
	}
	pattern := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return &EmailValidator{
		Message: message,
		pattern: pattern,
	}
}

// Validate implements the Validator interface
func (v *EmailValidator) Validate(value string) error {
	if value != "" && !v.pattern.MatchString(value) {
		return &ValidationError{
			Field:   "email",
			Message: v.Message,
		}
	}
	return nil
}

// LengthValidator validates the length of a field
type LengthValidator struct {
	MinLength int
	MaxLength int
	Message   string
}

// NewLengthValidator creates a new length validator
func NewLengthValidator(minLength, maxLength int, message string) *LengthValidator {
	if message == "" {
		if maxLength > 0 {
			message = fmt.Sprintf("Field must be between %d and %d characters", minLength, maxLength)
		} else {
			message = fmt.Sprintf("Field must be at least %d characters", minLength)
		}
	}
	return &LengthValidator{
		MinLength: minLength,
		MaxLength: maxLength,
		Message:   message,
	}
}

// Validate implements the Validator interface
func (v *LengthValidator) Validate(value string) error {
	length := len(value)
	if length < v.MinLength {
		return &ValidationError{
			Field:   "length",
			Message: v.Message,
		}
	}
	if v.MaxLength > 0 && length > v.MaxLength {
		return &ValidationError{
			Field:   "length",
			Message: v.Message,
		}
	}
	return nil
}

// InputField represents a single input field
type InputField struct {
	Name        string
	Label       string
	InputType   InputType
	Placeholder string
	Value       string
	Validators  []Validator
	Required    bool
	Disabled    bool
	HelpText    string
	Errors      []error
}

// NewInputField creates a new input field
func NewInputField(name, label string, inputType InputType) *InputField {
	field := &InputField{
		Name:      name,
		Label:     label,
		InputType: inputType,
		Errors:    make([]error, 0),
	}
	
	// Add required validator if field is required
	if field.Required {
		field.Validators = append(field.Validators, NewRequiredValidator(""))
	}
	
	return field
}

// AddValidator adds a validator to the field
func (f *InputField) AddValidator(validator Validator) {
	f.Validators = append(f.Validators, validator)
}

// Validate validates the field value
func (f *InputField) Validate() error {
	f.Errors = f.Errors[:0] // Clear previous errors
	
	for _, validator := range f.Validators {
		if err := validator.Validate(f.Value); err != nil {
			f.Errors = append(f.Errors, err)
		}
	}
	
	if len(f.Errors) > 0 {
		return &InputError{
			Message: fmt.Sprintf("validation failed for field '%s'", f.Name),
			Err:     f.Errors[0], // Return the first error
		}
	}
	
	return nil
}

// SetValue sets the field value
func (f *InputField) SetValue(value string) {
	f.Value = value
}

// Render renders the input field as HTML
func (f *InputField) Render() string {
	disabledAttr := ""
	if f.Disabled {
		disabledAttr = " disabled"
	}
	
	errorClass := ""
	if len(f.Errors) > 0 {
		errorClass = " error"
	}
	
	errorHTML := ""
	if len(f.Errors) > 0 {
		errorMessages := make([]string, len(f.Errors))
		for i, err := range f.Errors {
			errorMessages[i] = err.Error()
		}
		errorHTML = fmt.Sprintf(`<div class="field-error">%s</div>`, strings.Join(errorMessages, "<br>"))
	}
	
	helpHTML := ""
	if f.HelpText != "" {
		helpHTML = fmt.Sprintf(`<div class="field-help">%s</div>`, f.HelpText)
	}
	
	return fmt.Sprintf(
		`<div class="field%s">`+
			`<label for="%s">%s</label>`+
			`<input type="%s" name="%s" id="%s" placeholder="%s" value="%s"%s>`+
			`%s%s`+
			`</div>`,
		errorClass, f.Name, f.Label, f.InputType, f.Name, f.Name,
		f.Placeholder, f.Value, disabledAttr, errorHTML, helpHTML,
	)
}

// Form represents a form component
type Form struct {
	Name           string
	Action         string
	Method         string
	Fields         map[string]*InputField
	SubmitHandlers []func(map[string]string) error
	Errors         []error
}

// NewForm creates a new form
func NewForm(name string) *Form {
	return &Form{
		Name:           name,
		Method:         "POST",
		Fields:         make(map[string]*InputField),
		SubmitHandlers: make([]func(map[string]string) error, 0),
		Errors:         make([]error, 0),
	}
}

// AddField adds a field to the form
func (f *Form) AddField(field *InputField) error {
	if field == nil {
		return errors.New("cannot add nil field to form")
	}
	f.Fields[field.Name] = field
	return nil
}

// GetField gets a field by name
func (f *Form) GetField(name string) *InputField {
	return f.Fields[name]
}

// SetValue sets the value of a field
func (f *Form) SetValue(fieldName, value string) error {
	field := f.GetField(fieldName)
	if field == nil {
		return errors.New("field not found")
	}
	field.SetValue(value)
	return nil
}

// Validate validates all fields in the form
func (f *Form) Validate() error {
	f.Errors = f.Errors[:0] // Clear previous errors
	
	for _, field := range f.Fields {
		if err := field.Validate(); err != nil {
			f.Errors = append(f.Errors, err)
		}
	}
	
	if len(f.Errors) > 0 {
		return &InputError{
			Message: fmt.Sprintf("form validation failed"),
			Err:     f.Errors[0],
		}
	}
	
	return nil
}

// GetData gets all field values as a map
func (f *Form) GetData() map[string]string {
	data := make(map[string]string)
	for name, field := range f.Fields {
		data[name] = field.Value
	}
	return data
}

// AddSubmitHandler adds a submit handler
func (f *Form) AddSubmitHandler(handler func(map[string]string) error) {
	f.SubmitHandlers = append(f.SubmitHandlers, handler)
}

// Submit submits the form
func (f *Form) Submit() error {
	if err := f.Validate(); err != nil {
		return err
	}
	
	data := f.GetData()
	
	for _, handler := range f.SubmitHandlers {
		if err := handler(data); err != nil {
			f.Errors = append(f.Errors, &InputError{
				Message: "submission failed",
				Err:     err,
			})
			return f.Errors[0]
		}
	}
	
	return nil
}

// Render renders the form as HTML
func (f *Form) Render() string {
	fieldHTML := ""
	for _, field := range f.Fields {
		fieldHTML += field.Render()
	}
	
	errorHTML := ""
	if len(f.Errors) > 0 {
		errorMessages := make([]string, len(f.Errors))
		for i, err := range f.Errors {
			errorMessages[i] = err.Error()
		}
		errorHTML = fmt.Sprintf(`<div class="form-errors">%s</div>`, strings.Join(errorMessages, "<br>"))
	}
	
	return fmt.Sprintf(
		`<form name="%s" action="%s" method="%s">`+
			`%s`+
			`%s`+
			`<button type="submit">Submit</button>`+
			`</form>`,
		f.Name, f.Action, f.Method, errorHTML, fieldHTML,
	)
}

// String returns a string representation of the form
func (f *Form) String() string {
	return fmt.Sprintf("Form('%s', %d fields)", f.Name, len(f.Fields))
}
```

## Notes
- Use proper struct definitions with clear fields and methods
- Follow Go's naming conventions (PascalCase for exported, camelCase for unexported)
- Use interfaces for abstraction and dependency injection
- Implement proper error handling with custom error types
- Use composition over inheritance
- Write comprehensive tests using Go's testing package
- Use godoc comments for proper documentation
- Follow Go's "less is more" philosophy
- Use constructor functions for creating components
- Implement proper validation and error handling
- Use goroutines and channels for concurrency where appropriate