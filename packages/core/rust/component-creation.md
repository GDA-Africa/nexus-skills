---
skill: component-creation
version: 1.0.0
framework: rust
category: ui
triggers:
  - "component creation"
  - "Rust components"
  - "Rust patterns"
  - "component architecture"
author: "@nexus-framework/skills"
status: active
---

# Skill: Component Creation (Rust)

## When to Read This
Read this skill when creating new Rust components, designing component architecture, or establishing component patterns in a Rust application.

## Context
This project follows Rust's idiomatic patterns with a focus on memory safety, zero-cost abstractions, and clear ownership semantics. We use Rust's built-in features like structs, enums, traits, and pattern matching. Components are designed to be modular, type-safe, and maintainable with proper separation of concerns and clear interfaces. We follow Rust's philosophy of "zero-cost abstractions" with performance in mind.

## Steps
1. Define component purpose and responsibilities
2. Create proper struct and enum definitions with clear fields
3. Implement component with proper ownership and borrowing
4. Add proper error handling with Result and Option types
5. Implement proper trait implementations for abstraction
6. Add proper documentation and examples
7. Write comprehensive tests for the component
8. Document component usage and interfaces

## Patterns We Use
- Structs and Enums: Use proper data structures with clear fields
- Traits: Use traits for abstraction and polymorphism
- Ownership: Use proper ownership and borrowing semantics
- Error handling: Use Result and Option types for error handling
- Pattern matching: Use pattern matching for control flow
- Documentation: Use rustdoc comments and examples
- Testing: Use Rust's built-in testing framework
- Memory safety: Leverage Rust's memory safety guarantees
- Zero-cost abstractions: Use abstractions that don't impact performance

## Anti-Patterns — Never Do This
- ❌ Do not create overly complex structs with too many responsibilities
- ❌ Do not ignore ownership and borrowing rules
- ❌ Do not use unwrap() in production code
- ❌ Do not create components that are too tightly coupled
- ❌ Do not ignore Rust's naming conventions
- ❌ Do not forget to write tests for your components
- ❌ Do not ignore Rust's performance considerations
- ❌ Do not create unnecessary abstractions that impact performance

## Example

```rust
// src/components/button.rs
use std::fmt;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ButtonVariant {
    Primary,
    Secondary,
    Ghost,
    Danger,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ButtonSize {
    Small,
    Medium,
    Large,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ButtonState {
    Normal,
    Hover,
    Pressed,
    Disabled,
}

#[derive(Debug)]
pub struct ButtonError {
    message: String,
}

impl ButtonError {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
        }
    }
}

impl fmt::Display for ButtonError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Button error: {}", self.message)
    }
}

impl std::error::Error for ButtonError {}

#[derive(Debug, Clone)]
pub struct ButtonStyle {
    pub background_color: String,
    pub text_color: String,
    pub border_color: String,
    pub border_radius: u32,
    pub padding: (u32, u32), // (vertical, horizontal)
    pub font_size: u32,
    pub font_weight: String,
}

impl Default for ButtonStyle {
    fn default() -> Self {
        Self {
            background_color: "#007bff".to_string(),
            text_color: "#ffffff".to_string(),
            border_color: "#007bff".to_string(),
            border_radius: 4,
            padding: (8, 16),
            font_size: 14,
            font_weight: "normal".to_string(),
        }
    }
}

impl ButtonStyle {
    pub fn new(
        background_color: impl Into<String>,
        text_color: impl Into<String>,
        border_color: impl Into<String>,
        border_radius: u32,
        padding: (u32, u32),
        font_size: u32,
        font_weight: impl Into<String>,
    ) -> Self {
        Self {
            background_color: background_color.into(),
            text_color: text_color.into(),
            border_color: border_color.into(),
            border_radius,
            padding,
            font_size,
            font_weight: font_weight.into(),
        }
    }
}

pub type ButtonClickHandler = Box<dyn Fn() -> Result<(), ButtonError>>;

#[derive(Debug)]
pub struct Button {
    text: String,
    variant: ButtonVariant,
    size: ButtonSize,
    on_click: Option<ButtonClickHandler>,
    style: ButtonStyle,
    enabled: bool,
    tooltip: Option<String>,
    state: ButtonState,
}

impl Button {
    pub fn new(text: impl Into<String>) -> Result<Self, ButtonError> {
        let text = text.into();
        if text.trim().is_empty() {
            return Err(ButtonError::new("Button text cannot be empty"));
        }

        Ok(Self {
            text: text.trim().to_string(),
            variant: ButtonVariant::Primary,
            size: ButtonSize::Medium,
            on_click: None,
            style: ButtonStyle::default(),
            enabled: true,
            tooltip: None,
            state: ButtonState::Normal,
        })
    }

    pub fn set_text(&mut self, text: impl Into<String>) -> Result<(), ButtonError> {
        let text = text.into();
        if text.trim().is_empty() {
            return Err(ButtonError::new("Button text cannot be empty"));
        }
        self.text = text.trim().to_string();
        Ok(())
    }

    pub fn text(&self) -> &str {
        &self.text
    }

    pub fn set_variant(&mut self, variant: ButtonVariant) {
        self.variant = variant;
        self.style = Self::default_style_for_variant(variant);
    }

    pub fn variant(&self) -> ButtonVariant {
        self.variant
    }

    pub fn set_size(&mut self, size: ButtonSize) {
        self.size = size;
    }

    pub fn size(&self) -> ButtonSize {
        self.size
    }

    pub fn set_on_click(&mut self, handler: impl Fn() -> Result<(), ButtonError> + 'static) {
        self.on_click = Some(Box::new(handler));
    }

    pub fn set_enabled(&mut self, enabled: bool) {
        self.enabled = enabled;
        if !enabled {
            self.state = ButtonState::Disabled;
        } else if self.state == ButtonState::Disabled {
            self.state = ButtonState::Normal;
        }
    }

    pub fn enabled(&self) -> bool {
        self.enabled
    }

    pub fn set_tooltip(&mut self, tooltip: impl Into<String>) {
        self.tooltip = Some(tooltip.into());
    }

    pub fn tooltip(&self) -> Option<&str> {
        self.tooltip.as_deref()
    }

    pub fn render(&self) -> String {
        let disabled_attr = if !self.enabled { " disabled" } else { "" };
        let tooltip_attr = self.tooltip
            .as_ref()
            .map(|t| format!(r#" title="{}""#, t))
            .unwrap_or_default();

        format!(
            r#"<button class="btn btn-{} btn-{}"{}{} style="{}">{}</button>"#,
            self.variant_css_class(),
            self.size_css_class(),
            disabled_attr,
            tooltip_attr,
            self.css_style(),
            self.text
        )
    }

    pub fn click(&mut self) -> Result<(), ButtonError> {
        if !self.enabled {
            return Err(ButtonError::new("Cannot click disabled button"));
        }

        self.state = ButtonState::Pressed;
        let result = if let Some(handler) = &self.on_click {
            handler()
        } else {
            Ok(())
        };
        self.state = ButtonState::Normal;
        result
    }

    pub fn set_hover(&mut self) {
        if self.enabled {
            self.state = ButtonState::Hover;
        }
    }

    pub fn set_leave(&mut self) {
        if self.enabled {
            self.state = ButtonState::Normal;
        }
    }

    pub fn state(&self) -> ButtonState {
        self.state
    }

    fn default_style_for_variant(variant: ButtonVariant) -> ButtonStyle {
        match variant {
            ButtonVariant::Primary => ButtonStyle::new(
                "#007bff",
                "#ffffff",
                "#007bff",
                4,
                (8, 16),
                14,
                "normal",
            ),
            ButtonVariant::Secondary => ButtonStyle::new(
                "#6c757d",
                "#ffffff",
                "#6c757d",
                4,
                (8, 16),
                14,
                "normal",
            ),
            ButtonVariant::Ghost => ButtonStyle::new(
                "transparent",
                "#212529",
                "transparent",
                4,
                (8, 16),
                14,
                "normal",
            ),
            ButtonVariant::Danger => ButtonStyle::new(
                "#dc3545",
                "#ffffff",
                "#dc3545",
                4,
                (8, 16),
                14,
                "normal",
            ),
        }
    }

    fn variant_css_class(&self) -> &'static str {
        match self.variant {
            ButtonVariant::Primary => "primary",
            ButtonVariant::Secondary => "secondary",
            ButtonVariant::Ghost => "ghost",
            ButtonVariant::Danger => "danger",
        }
    }

    fn size_css_class(&self) -> &'static str {
        match self.size {
            ButtonSize::Small => "small",
            ButtonSize::Medium => "medium",
            ButtonSize::Large => "large",
        }
    }

    fn css_style(&self) -> String {
        let (v_pad, h_pad) = self.style.padding;
        format!(
            "background-color: {}; color: {}; border-color: {}; border-radius: {}px; padding: {}px {}px; font-size: {}px; font-weight: {};",
            self.style.background_color,
            self.style.text_color,
            self.style.border_color,
            self.style.border_radius,
            v_pad,
            h_pad,
            self.style.font_size,
            self.style.font_weight,
        )
    }
}

impl fmt::Display for Button {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "Button('{}', {:?}, {:?})",
            self.text, self.variant, self.size
        )
    }
}

#[derive(Debug)]
pub struct ButtonGroup {
    buttons: Vec<Button>,
}

impl ButtonGroup {
    pub fn new() -> Self {
        Self { buttons: Vec::new() }
    }

    pub fn add_button(&mut self, button: Button) -> Result<(), ButtonError> {
        self.buttons.push(button);
        Ok(())
    }

    pub fn remove_button(&mut self, index: usize) -> Option<Button> {
        if index < self.buttons.len() {
            Some(self.buttons.remove(index))
        } else {
            None
        }
    }

    pub fn enable_all(&mut self) {
        for button in &mut self.buttons {
            button.set_enabled(true);
        }
    }

    pub fn disable_all(&mut self) {
        for button in &mut self.buttons {
            button.set_enabled(false);
        }
    }

    pub fn render(&self) -> String {
        let button_html: String = self.buttons.iter().map(|b| b.render()).collect();
        format!(r#"<div class="btn-group">{}</div>"#, button_html)
    }

    pub fn buttons(&self) -> &[Button] {
        &self.buttons
    }

    pub fn buttons_mut(&mut self) -> &mut [Button] {
        &mut self.buttons
    }

    pub fn len(&self) -> usize {
        self.buttons.len()
    }

    pub fn is_empty(&self) -> bool {
        self.buttons.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_button_creation() {
        let button = Button::new("Click me").unwrap();
        assert_eq!(button.text(), "Click me");
        assert!(button.enabled());
    }

    #[test]
    fn test_button_empty_text() {
        let result = Button::new("");
        assert!(result.is_err());
    }

    #[test]
    fn test_button_click() {
        let mut button = Button::new("Click me").unwrap();
        assert!(button.click().is_ok());
    }

    #[test]
    fn test_button_disabled_click() {
        let mut button = Button::new("Click me").unwrap();
        button.set_enabled(false);
        assert!(button.click().is_err());
    }
}
```

```rust
// src/components/card.rs
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CardVariant {
    Default,
    Elevated,
    Outlined,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CardSize {
    Small,
    Medium,
    Large,
}

#[derive(Debug)]
pub struct CardError {
    message: String,
}

impl CardError {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
        }
    }
}

impl std::fmt::Display for CardError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Card error: {}", self.message)
    }
}

impl std::error::Error for CardError {}

#[derive(Debug, Clone)]
pub struct CardStyle {
    pub background_color: String,
    pub border_color: String,
    pub border_radius: u32,
    pub box_shadow: String,
    pub padding: (u32, u32),
    pub margin: (u32, u32),
}

impl Default for CardStyle {
    fn default() -> Self {
        Self {
            background_color: "#ffffff".to_string(),
            border_color: "#e9ecef".to_string(),
            border_radius: 8,
            box_shadow: "0 2px 4px rgba(0,0,0,0.1)".to_string(),
            padding: (16, 16),
            margin: (0, 0),
        }
    }
}

#[derive(Debug)]
pub struct Card {
    title: Option<String>,
    content: String,
    variant: CardVariant,
    size: CardSize,
    style: CardStyle,
    collapsible: bool,
    collapsed: bool,
}

impl Card {
    pub fn new(content: impl Into<String>) -> Self {
        Self {
            title: None,
            content: content.into(),
            variant: CardVariant::Default,
            size: CardSize::Medium,
            style: CardStyle::default(),
            collapsible: false,
            collapsed: false,
        }
    }

    pub fn set_title(&mut self, title: impl Into<String>) -> Result<(), CardError> {
        let title = title.into();
        if !title.trim().is_empty() {
            self.title = Some(title.trim().to_string());
        } else if !title.is_empty() {
            return Err(CardError::new("Card title cannot be empty"));
        }
        Ok(())
    }

    pub fn title(&self) -> Option<&str> {
        self.title.as_deref()
    }

    pub fn set_content(&mut self, content: impl Into<String>) {
        self.content = content.into();
    }

    pub fn content(&self) -> &str {
        &self.content
    }

    pub fn set_variant(&mut self, variant: CardVariant) {
        self.variant = variant;
        self.style = Self::default_style_for_variant(variant);
    }

    pub fn variant(&self) -> CardVariant {
        self.variant
    }

    pub fn set_size(&mut self, size: CardSize) {
        self.size = size;
    }

    pub fn size(&self) -> CardSize {
        self.size
    }

    pub fn set_collapsible(&mut self, collapsible: bool) {
        self.collapsible = collapsible;
        if !collapsible {
            self.collapsed = false;
        }
    }

    pub fn collapsible(&self) -> bool {
        self.collapsible
    }

    pub fn set_collapsed(&mut self, collapsed: bool) -> Result<(), CardError> {
        if !self.collapsible {
            return Err(CardError::new("Cannot collapse a non-collapsible card"));
        }
        self.collapsed = collapsed;
        Ok(())
    }

    pub fn collapsed(&self) -> bool {
        self.collapsed
    }

    pub fn toggle(&mut self) -> Result<(), CardError> {
        if !self.collapsible {
            return Err(CardError::new("Cannot toggle a non-collapsible card"));
        }
        self.collapsed = !self.collapsed;
        Ok(())
    }

    pub fn render(&self) -> String {
        let css_class = format!(
            "card card-{} card-{}",
            self.variant_css_class(),
            self.size_css_class()
        );
        let style_attr = format!(r#" style="{}""#, self.css_style());

        let header_html = if let Some(title) = &self.title {
            let collapse_button = if self.collapsible {
                let collapse_icon = if self.collapsed { "▼" } else { "▲" };
                format!(
                    r#"<button class="card-collapse-btn" onclick="toggleCard(this)"> {}</button>"#,
                    collapse_icon
                )
            } else {
                String::new()
            };

            format!(
                r#"<div class="card-header"><h3 class="card-title">{}</h3>{}</div>"#,
                title, collapse_button
            )
        } else {
            String::new()
        };

        let content_class = if self.collapsed {
            "card-content card-collapsed"
        } else {
            "card-content"
        };
        let content_html = format!(r#"<div class="{}">{}</div>"#, content_class, self.content);

        format!(r#"<div class="{}"{}>{}{}</div>"#, css_class, style_attr, header_html, content_html)
    }

    pub fn serialize(&self) -> HashMap<String, serde_json::Value> {
        let mut map = HashMap::new();
        map.insert("title".to_string(), self.title.as_ref().map_or(serde_json::Value::Null, |t| serde_json::Value::String(t.clone())));
        map.insert("content".to_string(), serde_json::Value::String(self.content.clone()));
        map.insert("variant".to_string(), serde_json::Value::String(self.variant.to_string()));
        map.insert("size".to_string(), serde_json::Value::String(self.size.to_string()));
        map.insert("collapsible".to_string(), serde_json::Value::Bool(self.collapsible));
        map.insert("collapsed".to_string(), serde_json::Value::Bool(self.collapsed));
        map
    }

    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(&self.serialize())
    }

    fn default_style_for_variant(variant: CardVariant) -> CardStyle {
        match variant {
            CardVariant::Default => CardStyle {
                background_color: "#ffffff".to_string(),
                border_color: "#e9ecef".to_string(),
                border_radius: 8,
                box_shadow: "0 2px 4px rgba(0,0,0,0.1)".to_string(),
                padding: (16, 16),
                margin: (0, 0),
            },
            CardVariant::Elevated => CardStyle {
                background_color: "#ffffff".to_string(),
                border_color: "#e9ecef".to_string(),
                border_radius: 8,
                box_shadow: "0 4px 8px rgba(0,0,0,0.15)".to_string(),
                padding: (16, 16),
                margin: (0, 0),
            },
            CardVariant::Outlined => CardStyle {
                background_color: "#ffffff".to_string(),
                border_color: "#dee2e6".to_string(),
                border_radius: 8,
                box_shadow: "none".to_string(),
                padding: (16, 16),
                margin: (0, 0),
            },
        }
    }

    fn variant_css_class(&self) -> &'static str {
        match self.variant {
            CardVariant::Default => "default",
            CardVariant::Elevated => "elevated",
            CardVariant::Outlined => "outlined",
        }
    }

    fn size_css_class(&self) -> &'static str {
        match self.size {
            CardSize::Small => "small",
            CardSize::Medium => "medium",
            CardSize::Large => "large",
        }
    }

    fn css_style(&self) -> String {
        let (v_pad, h_pad) = self.style.padding;
        let (v_mar, h_mar) = self.style.margin;
        format!(
            "background-color: {}; border: 1px solid {}; border-radius: {}px; box-shadow: {}; padding: {}px {}px; margin: {}px {}px;",
            self.style.background_color,
            self.style.border_color,
            self.style.border_radius,
            self.style.box_shadow,
            v_pad,
            h_pad,
            v_mar,
            h_mar,
        )
    }
}

impl std::fmt::Display for Card {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let title = self.title.as_deref().unwrap_or("No title");
        write!(
            f,
            "Card('{}', {:?}, {:?})",
            title, self.variant, self.size
        )
    }
}

impl std::fmt::Display for CardVariant {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CardVariant::Default => write!(f, "default"),
            CardVariant::Elevated => write!(f, "elevated"),
            CardVariant::Outlined => write!(f, "outlined"),
        }
    }
}

impl std::fmt::Display for CardSize {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CardSize::Small => write!(f, "small"),
            CardSize::Medium => write!(f, "medium"),
            CardSize::Large => write!(f, "large"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_card_creation() {
        let card = Card::new("Test content");
        assert_eq!(card.content(), "Test content");
        assert!(card.title().is_none());
    }

    #[test]
    fn test_card_title() {
        let mut card = Card::new("Test content");
        card.set_title("Test Title").unwrap();
        assert_eq!(card.title(), Some("Test Title"));
    }

    #[test]
    fn test_card_toggle() {
        let mut card = Card::new("Test content");
        card.set_collapsible(true);
        assert!(!card.collapsed());
        
        card.toggle().unwrap();
        assert!(card.collapsed());
        
        card.toggle().unwrap();
        assert!(!card.collapsed());
    }

    #[test]
    fn test_card_toggle_non_collapsible() {
        let mut card = Card::new("Test content");
        let result = card.toggle();
        assert!(result.is_err());
    }
}
```

```rust
// src/components/form.rs
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InputType {
    Text,
    Email,
    Password,
    Number,
    Tel,
    Url,
}

#[derive(Debug)]
pub struct InputError {
    message: String,
    field: Option<String>,
}

impl InputError {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            field: None,
        }
    }

    pub fn with_field(message: impl Into<String>, field: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            field: Some(field.into()),
        }
    }
}

impl std::fmt::Display for InputError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if let Some(field) = &self.field {
            write!(f, "Input error in field '{}': {}", field, self.message)
        } else {
            write!(f, "Input error: {}", self.message)
        }
    }
}

impl std::error::Error for InputError {}

#[derive(Debug)]
pub struct ValidationError {
    pub field: String,
    pub message: String,
}

impl std::fmt::Display for ValidationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Validation error in field '{}': {}", self.field, self.message)
    }
}

impl std::error::Error for ValidationError {}

pub trait Validator {
    fn validate(&self, value: &str) -> Result<(), ValidationError>;
}

#[derive(Debug)]
pub struct RequiredValidator {
    message: String,
}

impl RequiredValidator {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
        }
    }
}

impl Validator for RequiredValidator {
    fn validate(&self, value: &str) -> Result<(), ValidationError> {
        if value.trim().is_empty() {
            Err(ValidationError {
                field: "required".to_string(),
                message: self.message.clone(),
            })
        } else {
            Ok(())
        }
    }
}

#[derive(Debug)]
pub struct EmailValidator {
    message: String,
    pattern: regex::Regex,
}

impl EmailValidator {
    pub fn new(message: impl Into<String>) -> Self {
        let pattern = regex::Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap();
        Self {
            message: message.into(),
            pattern,
        }
    }
}

impl Validator for EmailValidator {
    fn validate(&self, value: &str) -> Result<(), ValidationError> {
        if !value.is_empty() && !self.pattern.is_match(value) {
            Err(ValidationError {
                field: "email".to_string(),
                message: self.message.clone(),
            })
        } else {
            Ok(())
        }
    }
}

#[derive(Debug)]
pub struct LengthValidator {
    min_length: usize,
    max_length: Option<usize>,
    message: String,
}

impl LengthValidator {
    pub fn new(min_length: usize, max_length: Option<usize>, message: impl Into<String>) -> Self {
        let message = if message.into().is_empty() {
            if let Some(max) = max_length {
                format!("Field must be between {} and {} characters", min_length, max)
            } else {
                format!("Field must be at least {} characters", min_length)
            }
        } else {
            message.into()
        };
        
        Self {
            min_length,
            max_length,
            message,
        }
    }
}

impl Validator for LengthValidator {
    fn validate(&self, value: &str) -> Result<(), ValidationError> {
        let length = value.len();
        if length < self.min_length {
            return Err(ValidationError {
                field: "length".to_string(),
                message: self.message.clone(),
            });
        }
        if let Some(max_length) = self.max_length {
            if length > max_length {
                return Err(ValidationError {
                    field: "length".to_string(),
                    message: self.message.clone(),
                });
            }
        }
        Ok(())
    }
}

#[derive(Debug)]
pub struct InputField {
    pub name: String,
    pub label: String,
    pub input_type: InputType,
    pub placeholder: String,
    pub value: String,
    pub validators: Vec<Box<dyn Validator>>,
    pub required: bool,
    pub disabled: bool,
    pub help_text: String,
    pub errors: Vec<ValidationError>,
}

impl InputField {
    pub fn new(name: impl Into<String>, label: impl Into<String>, input_type: InputType) -> Self {
        Self {
            name: name.into(),
            label: label.into(),
            input_type,
            placeholder: String::new(),
            value: String::new(),
            validators: Vec::new(),
            required: false,
            disabled: false,
            help_text: String::new(),
            errors: Vec::new(),
        }
    }

    pub fn add_validator(&mut self, validator: impl Validator + 'static) {
        self.validators.push(Box::new(validator));
    }

    pub fn validate(&mut self) -> Result<(), InputError> {
        self.errors.clear();

        for validator in &self.validators {
            if let Err(error) = validator.validate(&self.value) {
                self.errors.push(error);
            }
        }

        if !self.errors.is_empty() {
            return Err(InputError::with_field(
                format!("Validation failed for field '{}'", self.name),
                self.name.clone(),
            ));
        }

        Ok(())
    }

    pub fn set_value(&mut self, value: impl Into<String>) {
        self.value = value.into();
    }

    pub fn render(&self) -> String {
        let disabled_attr = if self.disabled { " disabled" } else { "" };
        let error_class = if !self.errors.is_empty() { " error" } else { "" };

        let error_html = if !self.errors.is_empty() {
            let error_messages: Vec<String> = self.errors.iter().map(|e| e.message.clone()).collect();
            format!(r#"<div class="field-error">{}</div>"#, error_messages.join("<br>"))
        } else {
            String::new()
        };

        let help_html = if !self.help_text.is_empty() {
            format!(r#"<div class="field-help">{}</div>"#, self.help_text)
        } else {
            String::new()
        };

        format!(
            r#"<div class="field{}"><label for="{}">{}</label><input type="{}" name="{}" id="{}" placeholder="{}" value="{}"{}>{}{}</div>"#,
            error_class,
            self.name,
            self.label,
            self.input_type.to_string(),
            self.name,
            self.name,
            self.placeholder,
            self.value,
            disabled_attr,
            error_html,
            help_html,
        )
    }
}

impl std::fmt::Display for InputType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            InputType::Text => write!(f, "text"),
            InputType::Email => write!(f, "email"),
            InputType::Password => write!(f, "password"),
            InputType::Number => write!(f, "number"),
            InputType::Tel => write!(f, "tel"),
            InputType::Url => write!(f, "url"),
        }
    }
}

#[derive(Debug)]
pub struct Form {
    pub name: String,
    pub action: String,
    pub method: String,
    pub fields: HashMap<String, InputField>,
    pub submit_handlers: Vec<Box<dyn Fn(&HashMap<String, String>) -> Result<(), InputError>>>,
    pub errors: Vec<InputError>,
}

impl Form {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            action: String::new(),
            method: "POST".to_string(),
            fields: HashMap::new(),
            submit_handlers: Vec::new(),
            errors: Vec::new(),
        }
    }

    pub fn add_field(&mut self, field: InputField) -> Result<(), InputError> {
        self.fields.insert(field.name.clone(), field);
        Ok(())
    }

    pub fn get_field(&self, name: &str) -> Option<&InputField> {
        self.fields.get(name)
    }

    pub fn get_field_mut(&mut self, name: &str) -> Option<&mut InputField> {
        self.fields.get_mut(name)
    }

    pub fn set_value(&mut self, field_name: &str, value: impl Into<String>) -> Result<(), InputError> {
        if let Some(field) = self.get_field_mut(field_name) {
            field.set_value(value);
            Ok(())
        } else {
            Err(InputError::new(format!("Field '{}' not found", field_name)))
        }
    }

    pub fn validate(&mut self) -> Result<(), InputError> {
        self.errors.clear();

        for field in self.fields.values_mut() {
            if let Err(error) = field.validate() {
                self.errors.push(error);
            }
        }

        if !self.errors.is_empty() {
            return Err(InputError::new(format!("Form validation failed")));
        }

        Ok(())
    }

    pub fn get_data(&self) -> HashMap<String, String> {
        self.fields.iter().map(|(name, field)| (name.clone(), field.value.clone())).collect()
    }

    pub fn add_submit_handler(&mut self, handler: impl Fn(&HashMap<String, String>) -> Result<(), InputError> + 'static) {
        self.submit_handlers.push(Box::new(handler));
    }

    pub fn submit(&mut self) -> Result<(), InputError> {
        if let Err(error) = self.validate() {
            return Err(error);
        }

        let data = self.get_data();

        for handler in &self.submit_handlers {
            if let Err(error) = handler(&data) {
                self.errors.push(error);
                return Err(InputError::new("Submission failed"));
            }
        }

        Ok(())
    }

    pub fn render(&self) -> String {
        let field_html: String = self.fields.values().map(|f| f.render()).collect();
        
        let error_html = if !self.errors.is_empty() {
            let error_messages: Vec<String> = self.errors.iter().map(|e| e.to_string()).collect();
            format!(r#"<div class="form-errors">{}</div>"#, error_messages.join("<br>"))
        } else {
            String::new()
        };

        format!(
            r#"<form name="{}" action="{}" method="{}">{}{}<button type="submit">Submit</button></form>"#,
            self.name, self.action, self.method, error_html, field_html,
        )
    }
}

impl std::fmt::Display for Form {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Form('{}', {} fields)", self.name, self.fields.len())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_input_field_validation() {
        let mut field = InputField::new("email", "Email", InputType::Email);
        field.add_validator(RequiredValidator::new("This field is required"));
        field.add_validator(EmailValidator::new("Please enter a valid email"));

        field.set_value("invalid-email");
        let result = field.validate();
        assert!(result.is_err());
        assert!(!field.errors.is_empty());
    }

    #[test]
    fn test_form_submission() {
        let mut form = Form::new("test-form");
        let mut field = InputField::new("name", "Name", InputType::Text);
        field.add_validator(RequiredValidator::new("Name is required"));
        form.add_field(field).unwrap();

        form.set_value("name", "John Doe").unwrap();
        let result = form.submit();
        assert!(result.is_ok());
    }
}
```

## Notes
- Use proper struct and enum definitions with clear fields and methods
- Follow Rust's naming conventions (snake_case for functions/fields, PascalCase for types)
- Use traits for abstraction and polymorphism
- Implement proper ownership and borrowing semantics
- Use Result and Option types for error handling
- Use pattern matching for control flow
- Write comprehensive tests using Rust's testing framework
- Use rustdoc comments for proper documentation
- Leverage Rust's memory safety guarantees
- Use zero-cost abstractions that don't impact performance
- Use proper lifetime annotations where needed
- Implement proper trait bounds for generic code