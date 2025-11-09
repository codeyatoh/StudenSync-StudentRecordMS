import React, { useState, useRef, useEffect } from 'react'
import { SearchIcon, ChevronDownIcon } from 'lucide-react'
import styles from './SearchableSelect.module.css'

function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  getOptionLabel = (option) => String(option.label || option.value || option),
  getOptionValue = (option) => String(option.value || option),
  disabled = false,
  required = false,
  className = '',
  label = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Get selected option
  const selectedOption = options.find(opt => getOptionValue(opt) === value)

  // Filter options based on search term
  const filteredOptions = options.filter(opt => {
    const label = getOptionLabel(opt).toLowerCase()
    return label.includes(searchTerm.toLowerCase())
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && dropdownRef.current) {
      const focusedElement = dropdownRef.current.children[focusedIndex]
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [focusedIndex, isOpen])

  const handleToggle = () => {
    if (disabled) return
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchTerm('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  const handleSelect = (option) => {
    const optionValue = getOptionValue(option)
    onChange({ target: { value: optionValue } })
    setIsOpen(false)
    setSearchTerm('')
    setFocusedIndex(-1)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setFocusedIndex(-1)
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleToggle()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
        break
      default:
        break
    }
  }

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      {label && (
        <label className={styles.label}>{label} {required && <span className={styles.required}>*</span>}</label>
      )}
      <div
        className={`${styles.selectWrapper} ${isOpen ? styles.open : ''} ${disabled ? styles.disabled : ''}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className={styles.selectedValue}>
          {selectedOption ? getOptionLabel(selectedOption) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
        </div>
        <ChevronDownIcon className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
      </div>
      
      {isOpen && (
        <div className={styles.dropdown} ref={dropdownRef}>
          <div className={styles.searchContainer}>
            <SearchIcon className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className={styles.searchInput}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className={styles.optionsList}>
            {filteredOptions.length === 0 ? (
              <div className={styles.noResults}>No results found</div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = getOptionValue(option)
                const optionLabel = getOptionLabel(option)
                const isSelected = optionValue === value
                const isFocused = index === focusedIndex

                return (
                  <div
                    key={optionValue}
                    className={`${styles.option} ${isSelected ? styles.selected : ''} ${isFocused ? styles.focused : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(option)
                    }}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    {optionLabel}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
      {required && !value && (
        <input
          type="text"
          value=""
          required
          className={styles.hiddenInput}
          tabIndex={-1}
          aria-hidden="true"
          onChange={() => {}}
        />
      )}
    </div>
  )
}

export default SearchableSelect

