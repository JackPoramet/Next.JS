'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatusCard,
  Button,
  IconButton,
  Input,
  Select,
  Textarea,
  Container,
  Section,
  Grid,
  Flex,
  Badge,
  StatusIndicator,
  MessageCount,
  Modal,
  ConfirmationModal
} from '@/components/ui';

export default function DesignSystemDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [_selectedDemo, _setSelectedDemo] = useState('');

  return (
    <Container size="xl">
      <Section
        title="🎨 Design System Showcase"
        subtitle="Complete UI Component Library for IoT Energy Management System"
        spacing="loose"
        background="light"
      >
        {/* Status Cards Demo */}
        <Section
          title="📊 Status Cards"
          background="card"
          spacing="normal"
        >
          <Grid cols={4} gap="md">
            <StatusCard
              title="Database"
              icon="🗄️"
              status="connected"
              message="Database connected successfully"
              lastCheck="10:30:25 AM"
              onClick={() => console.log('Database clicked')}
            />
            <StatusCard
              title="MQTT"
              icon="📡"
              status="error"
              message="Connection failed"
              lastCheck="10:29:45 AM"
            />
            <StatusCard
              title="API"
              icon="🌐"
              status="disconnected"
              message="Service unavailable"
              lastCheck="10:25:12 AM"
            />
          </Grid>
        </Section>

        {/* Cards Demo */}
        <Section
          title="🃏 Card Variants"
          background="card"
          spacing="normal"
        >
          <Grid cols={3} gap="md">
            <Card variant="default" size="md">
              <CardHeader>
                <CardTitle icon="📈">Default Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">This is a default card with standard styling.</p>
              </CardContent>
            </Card>

            <Card variant="elevated" size="md" interactive>
              <CardHeader>
                <CardTitle icon="⚡">Interactive Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">This card has hover effects and is clickable.</p>
              </CardContent>
            </Card>

            <Card variant="outlined" size="md">
              <CardHeader>
                <CardTitle icon="🎯">Outlined Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">This card uses outline styling.</p>
              </CardContent>
            </Card>
          </Grid>
        </Section>

        {/* Buttons Demo */}
        <Section
          title="🔘 Button Components"
          background="card"
          spacing="normal"
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-bold mb-4">Button Variants</h4>
              <Flex direction="row" wrap gap="md">
                <Button variant="primary" gradient>Primary Button</Button>
                <Button variant="secondary" gradient>Secondary Button</Button>
                <Button variant="success" gradient>Success Button</Button>
                <Button variant="warning" gradient>Warning Button</Button>
                <Button variant="error" gradient>Error Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="outline">Outline Button</Button>
              </Flex>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Button Sizes & States</h4>
              <Flex direction="row" wrap gap="md">
                <Button size="sm" leftIcon="🔍">Small</Button>
                <Button size="md" leftIcon="📊">Medium</Button>
                <Button size="lg" leftIcon="⚡" rightIcon="🚀">Large</Button>
                <Button size="xl" leftIcon="🎯">Extra Large</Button>
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
              </Flex>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Icon Buttons</h4>
              <Flex direction="row" wrap gap="md">
                <IconButton icon="✏️" variant="primary" aria-label="Edit" />
                <IconButton icon="🗑️" variant="error" aria-label="Delete" />
                <IconButton icon="👁️" variant="ghost" aria-label="View" />
                <IconButton icon="⚙️" variant="outline" size="lg" aria-label="Settings" />
              </Flex>
            </div>
          </div>
        </Section>

        {/* Form Components Demo */}
        <Section
          title="📝 Form Components"
          background="card"
          spacing="normal"
        >
          <Grid cols={2} gap="lg">
            <div className="space-y-6">
              <Input
                label="Email Address"
                placeholder="Enter your email"
                leftIcon="📧"
                fullWidth
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                leftIcon="🔒"
                rightIcon="👁️"
                fullWidth
              />
              
              <Input
                label="Error State"
                placeholder="This field has an error"
                errorText="This field is required"
                fullWidth
              />
              
              <Select
                label="Select Department"
                placeholder="Choose a department"
                fullWidth
                options={[
                  { value: 'engineering', label: '🔧 Engineering' },
                  { value: 'business', label: '💼 Business Administration' },
                  { value: 'architecture', label: '🏗️ Architecture' },
                  { value: 'liberal_arts', label: '📚 Liberal Arts' }
                ]}
              />
            </div>

            <div className="space-y-6">
              <Textarea
                label="Description"
                placeholder="Enter description..."
                rows={4}
                fullWidth
              />
              
              <Input
                label="Success State"
                placeholder="This field is valid"
                state="success"
                helperText="Looks good!"
                fullWidth
              />
              
              <Input
                label="Warning State"
                placeholder="This field has a warning"
                state="warning"
                helperText="Please double-check this value"
                fullWidth
              />
            </div>
          </Grid>
        </Section>

        {/* Badges and Status Demo */}
        <Section
          title="🏷️ Badges & Status Indicators"
          background="card"
          spacing="normal"
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-bold mb-4">Badges</h4>
              <Flex direction="row" wrap gap="md">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary" icon="📘">Primary</Badge>
                <Badge variant="success" icon="✅" rounded>Success</Badge>
                <Badge variant="warning" icon="⚠️">Warning</Badge>
                <Badge variant="error" icon="❌">Error</Badge>
                <Badge variant="info" outline>Info Outline</Badge>
                <MessageCount count={42} variant="primary" />
                <MessageCount count={1205} maxCount={999} variant="error" />
              </Flex>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Status Indicators</h4>
              <Flex direction="row" wrap gap="md">
                <StatusIndicator status="connected" />
                <StatusIndicator status="disconnected" showIcon={false} />
                <StatusIndicator status="error" label="Critical Error" />
                <StatusIndicator status="checking" size="lg" />
                <StatusIndicator status="warning" showLabel={false} />
              </Flex>
            </div>
          </div>
        </Section>

        {/* Modals Demo */}
        <Section
          title="🪟 Modal Components"
          background="card"
          spacing="normal"
        >
          <Flex direction="row" wrap gap="md">
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
            >
              Open Modal
            </Button>
            <Button
              variant="warning"
              onClick={() => setIsConfirmModalOpen(true)}
            >
              Confirmation Modal
            </Button>
          </Flex>
        </Section>

        {/* Layout Demo */}
        <Section
          title="📐 Layout Components"
          background="card"
          spacing="normal"
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-bold mb-4">Grid Layouts</h4>
              <Grid cols={6} gap="sm">
                {Array.from({ length: 6 }, (_, i) => (
                  <Card key={i} variant="filled" size="sm">
                    <CardContent>
                      <p className="text-center text-sm font-bold">Item {i + 1}</p>
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Flex Layouts</h4>
              <Flex direction="row" justify="between" align="center" className="bg-gray-100 p-4 rounded-xl">
                <Badge variant="primary">Left Item</Badge>
                <Badge variant="secondary">Center Item</Badge>
                <Badge variant="success">Right Item</Badge>
              </Flex>
            </div>
          </div>
        </Section>
      </Section>

      {/* Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This is an example modal showcasing the modal component. 
            You can close it by clicking the X button, pressing Escape, 
            or clicking outside the modal.
          </p>
          <Select
            label="Demo Select"
            placeholder="Choose an option"
            fullWidth
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' }
            ]}
          />
          <Flex direction="row" justify="end" gap="md">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Save Changes
            </Button>
          </Flex>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          console.log('Confirmed!');
          setIsConfirmModalOpen(false);
        }}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        variant="error"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Container>
  );
}
