---
item: application-packaging
project: context-builder
type: slice
dependencies: [all-core-features]
projectState: MVP complete, ready for distribution
status: not-started
lastUpdated: 2025-01-16
---

# Slice Design: Application Packaging

## Overview

**User Value:** Users can install and run Context Builder as a native desktop application on macOS, Windows, and Linux without requiring development environment setup.

**Business Value:** Enables distribution and adoption of Context Builder beyond development teams, providing professional installation experience across all major desktop platforms.

**Technical Scope:** Configure cross-platform Electron packaging, code signing, and automated build pipeline for production-ready application distribution.

## Success Criteria

### Primary Success Criteria
- [ ] **macOS Distribution**: DMG installer with proper code signing and notarization
- [ ] **Windows Distribution**: NSIS installer with code signing for Windows 10/11
- [ ] **Linux Distribution**: AppImage, deb, and rpm packages (no snap)
- [ ] **Automated Builds**: CI/CD pipeline generates all platform packages
- [ ] **Installation Verification**: Each package installs and launches successfully on target platforms

### Secondary Success Criteria
- [ ] **Professional Branding**: Custom icons, splash screens, and installer branding
- [ ] **Auto-Updates**: Update mechanism for seamless version upgrades
- [ ] **Digital Signatures**: All packages signed for security and trust
- [ ] **Release Management**: Versioned releases with changelogs and assets

## Technical Architecture

### 1. Build System Enhancement

**Current State:**
- electron-builder configured with basic macOS (dmg) and Windows (nsis) targets
- Missing Linux configuration and advanced packaging options

**Target Architecture:**
```
Build Pipeline
├── Source Build (electron-vite)
├── Platform Packaging (electron-builder)
│   ├── macOS: DMG + Code Signing + Notarization
│   ├── Windows: NSIS + Code Signing
│   └── Linux: AppImage + deb + rpm + tar.xz
├── Asset Management
└── Release Distribution
```

### 2. Platform-Specific Configurations

#### macOS Packaging
- **Format**: DMG disk image with drag-to-Applications workflow
- **Architecture**: Universal binary (x64 + arm64) for Intel and Apple Silicon
- **Code Signing**: Developer certificate with notarization for Gatekeeper
- **Integration**: Proper app bundle structure, launch services integration

#### Windows Packaging
- **Format**: NSIS installer with modern UI
- **Architecture**: x64 builds for Windows 10/11
- **Code Signing**: Authenticode certificate for Windows SmartScreen
- **Integration**: Start menu shortcuts, file associations, uninstaller

#### Linux Packaging
- **AppImage**: Portable, universal format requiring no installation
- **Debian/Ubuntu**: .deb packages for apt-based distributions
- **Red Hat/Fedora**: .rpm packages for yum/dnf-based distributions
- **Archive**: .tar.xz for manual installation and other distributions
- **No Snap**: Explicitly avoiding snap packages per project requirements

### 3. Code Signing and Security

**Certificate Management:**
- **macOS**: Apple Developer Program certificate + notarization service
- **Windows**: Code signing certificate (EV or standard)
- **Linux**: GPG signing for package repositories (future consideration)

**Security Implementation:**
- Secure certificate storage in CI/CD environment variables
- Automated signing during build process
- Verification steps for signed packages

### 4. Build Automation

**CI/CD Pipeline Structure:**
```yaml
Build Matrix:
  - Platform: macOS (runs-on: macos-latest)
    - Build universal binary
    - Sign with Apple certificate
    - Submit for notarization
    - Create DMG installer

  - Platform: Windows (runs-on: windows-latest)
    - Build x64 binary
    - Sign with Authenticode certificate
    - Create NSIS installer

  - Platform: Linux (runs-on: ubuntu-latest)
    - Build x64 binary
    - Package as AppImage
    - Create deb package
    - Create rpm package
    - Create tar.xz archive
```

## Implementation Plan

### Phase 1: Enhanced Build Configuration (Effort: 2/5)

**electron-builder Configuration:**
- Extend `package.json` build section with comprehensive platform targets
- Configure Linux packaging formats prioritized: tar.xz, AppImage, deb, rpm
- Set up proper app metadata (descriptions, categories, desktop entries)
- Configure file associations and MIME types
- Build unsigned packages for macOS and Windows (establishes process without certificates)

**Expected Changes:**
```json
{
  "build": {
    "appId": "com.mantatemplate.context-builder",
    "productName": "Context Builder",
    "directories": {
      "output": "dist"
    },
    "files": ["out/**", "resources/**"],
    "mac": {
      "target": [
        { "target": "dmg", "arch": ["x64", "arm64"] }
      ],
      "category": "public.app-category.developer-tools"
    },
    "win": {
      "target": [
        { "target": "nsis", "arch": ["x64"] }
      ]
    },
    "linux": {
      "target": [
        { "target": "tar.xz", "arch": ["x64"] },
        { "target": "AppImage", "arch": ["x64"] },
        { "target": "deb", "arch": ["x64"] },
        { "target": "rpm", "arch": ["x64"] }
      ],
      "category": "Development"
    }
  }
}
```

### Phase 2: Asset and Branding Integration (Effort: 2/5)

**Icon Creation:**
- Design application icons for all platforms (icns, ico, png sets)
- Create installer background images and splash screens
- Set up proper icon resolution sets for different contexts

**Metadata Configuration:**
- Application descriptions and categories for each platform
- Desktop entry specifications for Linux
- File association configurations
- Proper versioning and build information

### Phase 3: Linux Package Signing (Effort: 1/5)

**GPG Key Setup (Free):**
- Generate GPG key pair for package signing
- Publish public key to keyservers (keys.openpgp.org, keyserver.ubuntu.com)
- Configure electron-builder for automatic GPG signing of Linux packages

**Implementation:**
- Create dedicated GPG key for Context Builder releases
- Integrate GPG signing into build process
- Document public key fingerprint for user verification

### Phase 4: Code Signing Setup - Future Phase (Effort: 3/5)

**Certificate Acquisition (Future Implementation):**
- Apple Developer Program membership and certificates (when org is ready)
- Windows code signing certificate (after business verification)
- Set up secure certificate storage and access

**Signing Integration:**
- Configure electron-builder for automatic signing
- Set up notarization workflow for macOS
- Implement signing verification steps

**Security Considerations:**
- Secure certificate storage in CI environment
- Proper key management and rotation procedures
- Build process security hardening

### Phase 5: CI/CD Pipeline Implementation (Effort: 4/5)

**GitHub Actions Configuration:**
- Multi-platform build matrix setup
- Secure credential management
- Artifact storage and release creation
- Build verification and testing steps

**Release Automation:**
- Automated version tagging and changelog generation
- Release asset upload and organization
- Distribution to appropriate channels

**Quality Assurance:**
- Automated installation testing on each platform
- Package integrity verification
- Performance regression testing

### Phase 6: Distribution and Update Mechanism (Effort: 3/5)

**Release Distribution:**
- GitHub Releases for primary distribution
- Consider additional distribution channels (website, package managers)
- Documentation for installation procedures

**Auto-Update Implementation:**
- Integrate electron-updater for seamless updates
- Configure update servers and distribution
- Implement update notification UI

## Data Flows and Interactions

### Build Process Flow
```
Source Code Changes
    ↓
GitHub Repository Push
    ↓
CI/CD Pipeline Trigger
    ↓
Multi-Platform Build Matrix
    ├── macOS Build → Sign → Notarize → DMG
    ├── Windows Build → Sign → NSIS Installer
    └── Linux Build → AppImage + deb + rpm + tar.xz
    ↓
Release Asset Collection
    ↓
GitHub Release Creation
    ↓
Distribution to Users
```

### Installation and Update Flow
```
User Downloads Package
    ↓
Platform-Specific Installation
    ├── macOS: Mount DMG → Drag to Applications
    ├── Windows: Run NSIS → Install to Program Files
    └── Linux: chmod +x AppImage OR dpkg -i package.deb
    ↓
First Launch
    ↓
Auto-Update Check (if configured)
    ↓
Normal Application Usage
```

## Cross-Slice Dependencies

### Upstream Dependencies
- **All Core Features**: Requires completed and stable application functionality
- **Performance Optimization**: Must be completed for production-ready performance
- **Testing Infrastructure**: Automated tests must pass before packaging

### Downstream Integrations
- **Future Slice Considerations**: Update mechanism affects all future feature releases
- **Documentation Updates**: Installation guides for each platform
- **Support Infrastructure**: Platform-specific troubleshooting and support procedures

## Interface Specifications

### Build Script Interface
```bash
# Development builds
pnpm run ai:build

# Production release builds
pnpm run package:all
pnpm run package:mac
pnpm run package:win
pnpm run package:linux
```

### Release Asset Structure
```
context-builder-v1.0.0/
├── context-builder-1.0.0.dmg (macOS)
├── context-builder-1.0.0-setup.exe (Windows)
├── context-builder-1.0.0.AppImage (Linux)
├── context-builder-1.0.0.deb (Linux)
├── context-builder-1.0.0.rpm (Linux)
├── context-builder-1.0.0.tar.xz (Linux)
├── checksums.txt
└── CHANGELOG.md
```

## Configuration Files

### Primary Configuration Extensions
- **package.json**: Enhanced electron-builder configuration
- **.github/workflows/**: CI/CD pipeline definitions
- **build/**: Platform-specific resources (icons, installers)

### New Configuration Files
- **electron-builder.yml**: Extended packaging configuration
- **notarize.js**: macOS notarization automation
- **build/entitlements.plist**: macOS sandbox entitlements
- **build/installer.nsh**: Windows installer customization

## Risk Mitigation

### Technical Risks
- **Certificate Expiration**: Implement monitoring and renewal procedures
- **Platform API Changes**: Regular testing on target platform versions
- **Build Environment Dependencies**: Document and version-lock all build tools

### Distribution Risks
- **Gatekeeper/SmartScreen Warnings**: Proper code signing prevents security warnings
- **Package Repository Approval**: Linux packages may require approval for official repositories
- **Update Distribution**: Robust update mechanism prevents distribution fragmentation

## Quality Assurance

### Testing Requirements
- **Installation Testing**: Automated verification on clean VMs for each platform
- **Signing Verification**: Automated certificate and signature validation
- **Update Testing**: End-to-end update process verification
- **Cross-Platform Compatibility**: Feature parity testing across all platforms

### Success Metrics
- **Package Size**: < 200MB for all platform packages
- **Installation Time**: < 30 seconds on typical hardware
- **First Launch Time**: < 3 seconds from icon click to usable interface
- **Update Success Rate**: > 95% successful automatic updates

## Future Considerations

### Potential Enhancements
- **Package Manager Distribution**: Homebrew (macOS), Chocolatey (Windows), APT/YUM repositories (Linux)
- **Portable Versions**: ZIP archives for portable installations
- **Enterprise Deployment**: MSI packages for Windows enterprise environments
- **ARM Linux Support**: Building for ARM64 Linux platforms

### Maintenance Requirements
- **Certificate Renewal**: Annual renewal process for signing certificates
- **Platform Updates**: Regular testing on new OS versions
- **Dependency Updates**: Electron and build tool version management
- **Security Audits**: Regular security assessment of distribution pipeline

## Notes

**Technology Choices:**
- **electron-builder** chosen over electron-forge for comprehensive platform support
- **AppImage** preferred over snap for Linux to avoid snap dependency issues
- **NSIS** preferred over MSI for Windows due to better customization options

**Distribution Strategy:**
- **Primary**: GitHub Releases for direct distribution
- **Secondary**: Future consideration for package manager distribution
- **Enterprise**: Future MSI/enterprise deployment options if demand exists

**Code Signing Economics:**
- **Apple Developer Program**: $99/year for macOS distribution
- **Windows Code Signing**: ~$200-400/year depending on certificate type
- **ROI**: Professional installation experience justifies certificate costs

## Business Setup Sequence (Human Process)

For establishing proper organizational certificates and maximizing cloud/SaaS benefits:

### **Recommended Timeline (8 weeks before commercial release)**

1. **Business Registration** (Week 1)
   - Register new business entity in appropriate jurisdiction
   - Obtain federal tax ID/EIN
   - Set up business bank account

2. **DUNS Number Application** (Week 2)
   - Apply for DUNS number from Dun & Bradstreet
   - Required for Apple Developer Program organizational enrollment
   - Takes 1-2 weeks for approval

3. **Apple Developer Program** (Week 3-4)
   - Apply for organizational enrollment (not individual)
   - Requires DUNS number and business verification documents
   - 2-4 weeks for verification and approval

4. **Windows Code Signing Certificate** (Week 4-5)
   - Apply for business-verified code signing certificate
   - Standard or EV certificate from approved Certificate Authority
   - Requires business documentation and verification

5. **Cloud/SaaS Startup Programs** (Week 5-8)
   - Apply for AWS Activate, Azure for Startups, Google Cloud for Startups
   - GitHub Enterprise, various SaaS startup credit programs
   - Most require business entity and sometimes revenue thresholds

### **Benefits of New Organization**
- **Professional Distribution**: Proper business entity for app store distribution
- **Resource Access**: Significant cloud credits and enterprise features
- **Scalability**: Foundation for future commercial applications
- **Testing Ground**: Context Builder serves as pilot for commercial release process

### **Implementation Strategy**
- Start with unsigned builds to establish packaging process
- Add Linux GPG signing immediately (free, builds trust)
- Add commercial certificates when organizational setup is complete
- Use Context Builder as testing ground for commercial app distribution pipeline