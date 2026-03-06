---
skill: component-creation
version: 1.0.0
framework: python
category: ui
triggers:
  - "component creation"
  - "Python components"
  - "Python patterns"
  - "component architecture"
author: "@nexus-framework/skills"
status: active
---

# Skill: Component Creation (Python)

## When to Read This
Read this skill when creating new Python components, designing component architecture, or establishing component patterns in a Python application.

## Context
This project follows Python's object-oriented programming principles with a focus on clean code, proper encapsulation, and maintainability. We use Python's built-in features like classes, inheritance, composition, and type hints. Components are designed to be modular, testable, and maintainable with proper separation of concerns and clear interfaces.

## Steps
1. Define component purpose and responsibilities
2. Create proper class structure with clear interfaces
3. Implement component with proper encapsulation and abstraction
4. Add proper error handling and validation
5. Implement proper inheritance and composition patterns
6. Add proper documentation and type hints
7. Write comprehensive tests for the component
8. Document component usage and interfaces

## Patterns We Use
- Classes: Use proper class structure with clear interfaces
- Type hints: Use type hints for better code documentation and IDE support
- Composition: Use composition over inheritance where possible
- Encapsulation: Use proper access modifiers and encapsulation
- Error handling: Use proper exception handling with custom exceptions
- Documentation: Use docstrings and proper documentation
- Testing: Use pytest for comprehensive testing
- SOLID principles: Follow SOLID principles for good design

## Anti-Patterns — Never Do This
- ❌ Do not create overly complex classes with too many responsibilities
- ❌ Do not ignore type hints and documentation
- ❌ Do not hardcode values in components
- ❌ Do not forget to handle exceptions properly
- ❌ Do not create classes that are too tightly coupled
- ❌ Do not ignore the single responsibility principle
- ❌ Do not forget to write tests for your components
- ❌ Do not ignore Python's PEP 8 style guidelines

## Example

```python
# src/components/button.py
from abc import ABC, abstractmethod
from enum import Enum
from typing import Optional, Callable, Any
import logging

logger = logging.getLogger(__name__)

class ButtonVariant(Enum):
    PRIMARY = "primary"
    SECONDARY = "secondary"
    GHOST = "ghost"
    DANGER = "danger"

class ButtonSize(Enum):
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"

class ButtonState(Enum):
    NORMAL = "normal"
    HOVER = "hover"
    PRESSED = "pressed"
    DISABLED = "disabled"

class ButtonError(Exception):
    """Custom exception for button-related errors."""
    pass

class ButtonStyle:
    """Represents the visual style of a button."""
    
    def __init__(
        self,
        background_color: str = "#007bff",
        text_color: str = "#ffffff",
        border_color: str = "#007bff",
        border_radius: int = 4,
        padding: tuple[int, int] = (8, 16),
        font_size: int = 14,
        font_weight: str = "normal"
    ):
        self.background_color = background_color
        self.text_color = text_color
        self.border_color = border_color
        self.border_radius = border_radius
        self.padding = padding
        self.font_size = font_size
        self.font_weight = font_weight

class ButtonComponent(ABC):
    """Abstract base class for button components."""
    
    @abstractmethod
    def render(self) -> str:
        """Render the button as a string representation."""
        pass
    
    @abstractmethod
    def click(self) -> None:
        """Handle button click event."""
        pass
    
    @abstractmethod
    def set_enabled(self, enabled: bool) -> None:
        """Enable or disable the button."""
        pass

class Button(ButtonComponent):
    """A reusable button component."""
    
    def __init__(
        self,
        text: str,
        variant: ButtonVariant = ButtonVariant.PRIMARY,
        size: ButtonSize = ButtonSize.MEDIUM,
        on_click: Optional[Callable[[], None]] = None,
        style: Optional[ButtonStyle] = None,
        enabled: bool = True,
        tooltip: Optional[str] = None
    ):
        self._text = text
        self._variant = variant
        self._size = size
        self._on_click = on_click
        self._style = style or self._get_default_style(variant)
        self._enabled = enabled
        self._tooltip = tooltip
        self._state = ButtonState.NORMAL
        
        self._validate_inputs()
    
    def _validate_inputs(self) -> None:
        """Validate button inputs."""
        if not self._text or not self._text.strip():
            raise ButtonError("Button text cannot be empty")
        
        if self._on_click and not callable(self._on_click):
            raise ButtonError("on_click must be callable")
    
    def _get_default_style(self, variant: ButtonVariant) -> ButtonStyle:
        """Get default style based on variant."""
        style_map = {
            ButtonVariant.PRIMARY: ButtonStyle(
                background_color="#007bff",
                text_color="#ffffff",
                border_color="#007bff"
            ),
            ButtonVariant.SECONDARY: ButtonStyle(
                background_color="#6c757d",
                text_color="#ffffff",
                border_color="#6c757d"
            ),
            ButtonVariant.GHOST: ButtonStyle(
                background_color="transparent",
                text_color="#212529",
                border_color="transparent"
            ),
            ButtonVariant.DANGER: ButtonStyle(
                background_color="#dc3545",
                text_color="#ffffff",
                border_color="#dc3545"
            )
        }
        return style_map.get(variant, style_map[ButtonVariant.PRIMARY])
    
    @property
    def text(self) -> str:
        """Get the button text."""
        return self._text
    
    @text.setter
    def text(self, value: str) -> None:
        """Set the button text."""
        if not value or not value.strip():
            raise ButtonError("Button text cannot be empty")
        self._text = value.strip()
    
    @property
    def variant(self) -> ButtonVariant:
        """Get the button variant."""
        return self._variant
    
    @variant.setter
    def variant(self, value: ButtonVariant) -> None:
        """Set the button variant."""
        if not isinstance(value, ButtonVariant):
            raise ButtonError("Invalid variant")
        self._variant = value
        self._style = self._get_default_style(value)
    
    @property
    def size(self) -> ButtonSize:
        """Get the button size."""
        return self._size
    
    @size.setter
    def size(self, value: ButtonSize) -> None:
        """Set the button size."""
        if not isinstance(value, ButtonSize):
            raise ButtonError("Invalid size")
        self._size = value
    
    @property
    def enabled(self) -> bool:
        """Get whether the button is enabled."""
        return self._enabled
    
    @enabled.setter
    def enabled(self, value: bool) -> None:
        """Set whether the button is enabled."""
        self._enabled = value
        if not value:
            self._state = ButtonState.DISABLED
        elif self._state == ButtonState.DISABLED:
            self._state = ButtonState.NORMAL
    
    @property
    def tooltip(self) -> Optional[str]:
        """Get the button tooltip."""
        return self._tooltip
    
    @tooltip.setter
    def tooltip(self, value: Optional[str]) -> None:
        """Set the button tooltip."""
        self._tooltip = value
    
    def render(self) -> str:
        """Render the button as HTML."""
        disabled_attr = ' disabled' if not self._enabled else ''
        tooltip_attr = f' title="{self._tooltip}"' if self._tooltip else ''
        
        return (
            f'<button class="btn btn-{self._variant.value} btn-{self._size.value}"'
            f'{disabled_attr}{tooltip_attr} style="{self._get_css_style()}">'
            f'{self._text}</button>'
        )
    
    def _get_css_style(self) -> str:
        """Generate CSS style string."""
        padding_str = f"{self._style.padding[0]}px {self._style.padding[1]}px"
        
        return (
            f"background-color: {self._style.background_color}; "
            f"color: {self._style.text_color}; "
            f"border-color: {self._style.border_color}; "
            f"border-radius: {self._style.border_radius}px; "
            f"padding: {padding_str}; "
            f"font-size: {self._style.font_size}px; "
            f"font-weight: {self._style.font_weight};"
        )
    
    def click(self) -> None:
        """Handle button click event."""
        if not self._enabled:
            logger.warning("Attempted to click disabled button")
            return
        
        try:
            self._state = ButtonState.PRESSED
            if self._on_click:
                self._on_click()
            self._state = ButtonState.NORMAL
            logger.info(f"Button '{self._text}' clicked successfully")
        except Exception as e:
            logger.error(f"Error clicking button '{self._text}': {e}")
            self._state = ButtonState.NORMAL
            raise ButtonError(f"Failed to click button: {e}") from e
    
    def set_enabled(self, enabled: bool) -> None:
        """Enable or disable the button."""
        self.enabled = enabled
    
    def hover(self) -> None:
        """Handle mouse hover event."""
        if self._enabled:
            self._state = ButtonState.HOVER
    
    def leave(self) -> None:
        """Handle mouse leave event."""
        if self._enabled:
            self._state = ButtonState.NORMAL
    
    def __str__(self) -> str:
        """String representation of the button."""
        return f"Button('{self._text}', {self._variant.value}, {self._size.value})"
    
    def __repr__(self) -> str:
        """Detailed string representation of the button."""
        return (
            f"Button(text='{self._text}', variant={self._variant}, "
            f"size={self._size}, enabled={self._enabled})"
        )

class ButtonGroup:
    """A group of related buttons."""
    
    def __init__(self, buttons: list[Button] = None):
        self._buttons = buttons or []
    
    def add_button(self, button: Button) -> None:
        """Add a button to the group."""
        if not isinstance(button, Button):
            raise ButtonError("Only Button instances can be added to a ButtonGroup")
        self._buttons.append(button)
    
    def remove_button(self, button: Button) -> None:
        """Remove a button from the group."""
        if button in self._buttons:
            self._buttons.remove(button)
    
    def enable_all(self) -> None:
        """Enable all buttons in the group."""
        for button in self._buttons:
            button.enabled = True
    
    def disable_all(self) -> None:
        """Disable all buttons in the group."""
        for button in self._buttons:
            button.enabled = False
    
    def render(self) -> str:
        """Render all buttons as a group."""
        button_html = "".join(button.render() for button in self._buttons)
        return f'<div class="btn-group">{button_html}</div>'
    
    def __iter__(self):
        """Make ButtonGroup iterable."""
        return iter(self._buttons)
    
    def __len__(self) -> int:
        """Return the number of buttons in the group."""
        return len(self._buttons)
```

```python
# src/components/card.py
from abc import ABC, abstractmethod
from enum import Enum
from typing import Optional, Any, Dict
import json

class CardVariant(Enum):
    DEFAULT = "default"
    ELEVATED = "elevated"
    OUTLINED = "outlined"

class CardSize(Enum):
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"

class CardError(Exception):
    """Custom exception for card-related errors."""
    pass

class CardStyle:
    """Represents the visual style of a card."""
    
    def __init__(
        self,
        background_color: str = "#ffffff",
        border_color: str = "#e9ecef",
        border_radius: int = 8,
        box_shadow: str = "0 2px 4px rgba(0,0,0,0.1)",
        padding: tuple[int, int] = (16, 16),
        margin: tuple[int, int] = (0, 0)
    ):
        self.background_color = background_color
        self.border_color = border_color
        self.border_radius = border_radius
        self.box_shadow = box_shadow
        self.padding = padding
        self.margin = margin

class CardComponent(ABC):
    """Abstract base class for card components."""
    
    @abstractmethod
    def render(self) -> str:
        """Render the card as a string representation."""
        pass
    
    @abstractmethod
    def serialize(self) -> Dict[str, Any]:
        """Serialize the card to a dictionary."""
        pass

class Card(CardComponent):
    """A reusable card component."""
    
    def __init__(
        self,
        title: Optional[str] = None,
        content: str = "",
        variant: CardVariant = CardVariant.DEFAULT,
        size: CardSize = CardSize.MEDIUM,
        style: Optional[CardStyle] = None,
        collapsible: bool = False,
        collapsed: bool = False
    ):
        self._title = title
        self._content = content
        self._variant = variant
        self._size = size
        self._style = style or self._get_default_style(variant)
        self._collapsible = collapsible
        self._collapsed = collapsed if collapsible else False
        
        self._validate_inputs()
    
    def _validate_inputs(self) -> None:
        """Validate card inputs."""
        if self._title and not self._title.strip():
            raise CardError("Card title cannot be empty")
    
    def _get_default_style(self, variant: CardVariant) -> CardStyle:
        """Get default style based on variant."""
        style_map = {
            CardVariant.DEFAULT: CardStyle(
                background_color="#ffffff",
                border_color="#e9ecef",
                box_shadow="0 2px 4px rgba(0,0,0,0.1)"
            ),
            CardVariant.ELEVATED: CardStyle(
                background_color="#ffffff",
                border_color="#e9ecef",
                box_shadow="0 4px 8px rgba(0,0,0,0.15)"
            ),
            CardVariant.OUTLINED: CardStyle(
                background_color="#ffffff",
                border_color="#dee2e6",
                box_shadow="none"
            )
        }
        return style_map.get(variant, style_map[CardVariant.DEFAULT])
    
    @property
    def title(self) -> Optional[str]:
        """Get the card title."""
        return self._title
    
    @title.setter
    def title(self, value: Optional[str]) -> None:
        """Set the card title."""
        if value and not value.strip():
            raise CardError("Card title cannot be empty")
        self._title = value.strip() if value else None
    
    @property
    def content(self) -> str:
        """Get the card content."""
        return self._content
    
    @content.setter
    def content(self, value: str) -> None:
        """Set the card content."""
        self._content = str(value)
    
    @property
    def variant(self) -> CardVariant:
        """Get the card variant."""
        return self._variant
    
    @variant.setter
    def variant(self, value: CardVariant) -> None:
        """Set the card variant."""
        if not isinstance(value, CardVariant):
            raise CardError("Invalid variant")
        self._variant = value
        self._style = self._get_default_style(value)
    
    @property
    def size(self) -> CardSize:
        """Get the card size."""
        return self._size
    
    @size.setter
    def size(self, value: CardSize) -> None:
        """Set the card size."""
        if not isinstance(value, CardSize):
            raise CardError("Invalid size")
        self._size = value
    
    @property
    def collapsible(self) -> bool:
        """Get whether the card is collapsible."""
        return self._collapsible
    
    @collapsible.setter
    def collapsible(self, value: bool) -> None:
        """Set whether the card is collapsible."""
        self._collapsible = value
        if not value:
            self._collapsed = False
    
    @property
    def collapsed(self) -> bool:
        """Get whether the card is collapsed."""
        return self._collapsed
    
    @collapsed.setter
    def collapsed(self, value: bool) -> None:
        """Set whether the card is collapsed."""
        if not self._collapsible:
            raise CardError("Cannot collapse a non-collapsible card")
        self._collapsed = value
    
    def toggle(self) -> None:
        """Toggle the collapsed state."""
        if self._collapsible:
            self._collapsed = not self._collapsed
    
    def render(self) -> str:
        """Render the card as HTML."""
        css_class = f"card card-{self._variant.value} card-{self._size.value}"
        style_attr = f' style="{self._get_css_style()}"'
        
        header_html = ""
        if self._title:
            collapse_button = ""
            if self._collapsible:
                collapse_icon = "▼" if self._collapsed else "▲"
                collapse_button = (
                    f'<button class="card-collapse-btn" '
                    f'onclick="toggleCard(this)"> {collapse_icon}</button>'
                )
            
            header_html = (
                f'<div class="card-header">'
                f'<h3 class="card-title">{self._title}</h3>'
                f'{collapse_button}'
                f'</div>'
            )
        
        content_class = "card-content" + (" card-collapsed" if self._collapsed else "")
        content_html = f'<div class="{content_class}">{self._content}</div>'
        
        return f'<div class="{css_class}"{style_attr}>{header_html}{content_html}</div>'
    
    def _get_css_style(self) -> str:
        """Generate CSS style string."""
        padding_str = f"{self._style.padding[0]}px {self._style.padding[1]}px"
        margin_str = f"{self._style.margin[0]}px {self._style.margin[1]}px"
        
        return (
            f"background-color: {self._style.background_color}; "
            f"border: 1px solid {self._style.border_color}; "
            f"border-radius: {self._style.border_radius}px; "
            f"box-shadow: {self._style.box_shadow}; "
            f"padding: {padding_str}; "
            f"margin: {margin_str};"
        )
    
    def serialize(self) -> Dict[str, Any]:
        """Serialize the card to a dictionary."""
        return {
            "title": self._title,
            "content": self._content,
            "variant": self._variant.value,
            "size": self._size.value,
            "collapsible": self._collapsible,
            "collapsed": self._collapsed
        }
    
    def to_json(self) -> str:
        """Serialize the card to JSON."""
        return json.dumps(self.serialize(), indent=2)
    
    def __str__(self) -> str:
        """String representation of the card."""
        title_str = f"'{self._title}'" if self._title else "No title"
        return f"Card({title_str}, {self._variant.value}, {self._size.value})"
    
    def __repr__(self) -> str:
        """Detailed string representation of the card."""
        return (
            f"Card(title={self._title}, content='{self._content[:50]}...', "
            f"variant={self._variant}, size={self._size}, "
            f"collapsible={self._collapsible}, collapsed={self._collapsed})"
        )
```

```python
# src/components/form.py
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List, Callable
from enum import Enum
import re

class InputType(Enum):
    TEXT = "text"
    EMAIL = "email"
    PASSWORD = "password"
    NUMBER = "number"
    TEL = "tel"
    URL = "url"

class InputError(Exception):
    """Custom exception for input-related errors."""
    pass

class ValidationError(Exception):
    """Custom exception for validation errors."""
    pass

class Validator(ABC):
    """Abstract base class for input validators."""
    
    @abstractmethod
    def validate(self, value: str) -> bool:
        """Validate the input value."""
        pass
    
    @abstractmethod
    def get_error_message(self) -> str:
        """Get the error message for validation failure."""
        pass

class RequiredValidator(Validator):
    """Validator for required fields."""
    
    def __init__(self, message: str = "This field is required"):
        self.message = message
    
    def validate(self, value: str) -> bool:
        return bool(value and value.strip())
    
    def get_error_message(self) -> str:
        return self.message

class EmailValidator(Validator):
    """Validator for email fields."""
    
    def __init__(self, message: str = "Please enter a valid email address"):
        self.message = message
        self.email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    
    def validate(self, value: str) -> bool:
        return self.email_pattern.match(value) is not None
    
    def get_error_message(self) -> str:
        return self.message

class LengthValidator(Validator):
    """Validator for field length."""
    
    def __init__(self, min_length: int = 0, max_length: int = None, message: str = None):
        self.min_length = min_length
        self.max_length = max_length
        if message:
            self.message = message
        elif max_length:
            self.message = f"Field must be between {min_length} and {max_length} characters"
        else:
            self.message = f"Field must be at least {min_length} characters"
    
    def validate(self, value: str) -> bool:
        length = len(value)
        if length < self.min_length:
            return False
        if self.max_length and length > self.max_length:
            return False
        return True
    
    def get_error_message(self) -> str:
        return self.message

class InputField:
    """A single input field component."""
    
    def __init__(
        self,
        name: str,
        label: str,
        input_type: InputType = InputType.TEXT,
        placeholder: str = "",
        value: str = "",
        validators: List[Validator] = None,
        required: bool = False,
        disabled: bool = False,
        help_text: str = ""
    ):
        self.name = name
        self.label = label
        self.input_type = input_type
        self.placeholder = placeholder
        self.value = value
        self.validators = validators or []
        self.required = required
        self.disabled = disabled
        self.help_text = help_text
        self.errors: List[str] = []
        
        if required:
            self.validators.insert(0, RequiredValidator())
    
    def add_validator(self, validator: Validator) -> None:
        """Add a validator to the field."""
        self.validators.append(validator)
    
    def validate(self) -> bool:
        """Validate the field value."""
        self.errors.clear()
        
        for validator in self.validators:
            if not validator.validate(self.value):
                self.errors.append(validator.get_error_message())
        
        return len(self.errors) == 0
    
    def set_value(self, value: str) -> None:
        """Set the field value."""
        self.value = value
    
    def render(self) -> str:
        """Render the input field as HTML."""
        disabled_attr = ' disabled' if self.disabled else ''
        error_class = ' error' if self.errors else ''
        
        error_html = ""
        if self.errors:
            error_html = f'<div class="field-error">{"<br>".join(self.errors)}</div>'
        
        help_html = ""
        if self.help_text:
            help_html = f'<div class="field-help">{self.help_text}</div>'
        
        return (
            f'<div class="field{error_class}">'
            f'<label for="{self.name}">{self.label}</label>'
            f'<input type="{self.input_type.value}" '
            f'name="{self.name}" id="{self.name}" '
            f'placeholder="{self.placeholder}" '
            f'value="{self.value}"{disabled_attr}>'
            f'{error_html}'
            f'{help_html}'
            f'</div>'
        )

class Form:
    """A form component that manages multiple input fields."""
    
    def __init__(self, name: str, action: str = "", method: str = "POST"):
        self.name = name
        self.action = action
        self.method = method
        self.fields: Dict[str, InputField] = {}
        self.submit_handlers: List[Callable[[Dict[str, str]], None]] = []
        self.errors: List[str] = []
    
    def add_field(self, field: InputField) -> None:
        """Add a field to the form."""
        self.fields[field.name] = field
    
    def get_field(self, name: str) -> Optional[InputField]:
        """Get a field by name."""
        return self.fields.get(name)
    
    def set_value(self, field_name: str, value: str) -> None:
        """Set the value of a field."""
        field = self.get_field(field_name)
        if field:
            field.set_value(value)
    
    def validate(self) -> bool:
        """Validate all fields in the form."""
        self.errors.clear()
        all_valid = True
        
        for field in self.fields.values():
            if not field.validate():
                all_valid = False
        
        return all_valid
    
    def get_data(self) -> Dict[str, str]:
        """Get all field values as a dictionary."""
        return {name: field.value for name, field in self.fields.items()}
    
    def add_submit_handler(self, handler: Callable[[Dict[str, str]], None]) -> None:
        """Add a submit handler."""
        self.submit_handlers.append(handler)
    
    def submit(self) -> bool:
        """Submit the form."""
        if not self.validate():
            return False
        
        data = self.get_data()
        
        try:
            for handler in self.submit_handlers:
                handler(data)
            return True
        except Exception as e:
            self.errors.append(f"Submission failed: {str(e)}")
            return False
    
    def render(self) -> str:
        """Render the form as HTML."""
        field_html = "".join(field.render() for field in self.fields.values())
        
        error_html = ""
        if self.errors:
            error_html = (
                f'<div class="form-errors">'
                f'{"<br>".join(self.errors)}</div>'
            )
        
        return (
            f'<form name="{self.name}" action="{self.action}" '
            f'method="{self.method}">'
            f'{error_html}'
            f'{field_html}'
            f'<button type="submit">Submit</button>'
            f'</form>'
        )
    
    def __str__(self) -> str:
        """String representation of the form."""
        return f"Form('{self.name}', {len(self.fields)} fields)"
    
    def __repr__(self) -> str:
        """Detailed string representation of the form."""
        return (
            f"Form(name='{self.name}', action='{self.action}', "
            f"method='{self.method}', fields={list(self.fields.keys())})"
        )
```

## Notes
- Use proper class structure with clear interfaces and inheritance
- Follow Python's PEP 8 style guidelines
- Use type hints for better code documentation and IDE support
- Implement proper error handling with custom exceptions
- Use composition over inheritance where possible
- Write comprehensive tests using pytest
- Use docstrings for proper documentation
- Follow SOLID principles for good object-oriented design
- Use abstract base classes for defining interfaces
- Implement proper encapsulation with private attributes
- Use properties for controlled access to attributes