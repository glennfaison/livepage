"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dataSourceIdList, decodeDataSourceSettings, encodeDataSourceSettings, getDataSourceInfo } from "@/features/data-sources"
import type { DataSourceInfo, DataSourceSettings, SettingsField as DataSourceSettingsField } from "@/features/data-sources/types"
import { getComponentInfo } from "@/features/design-components"
import type { DesignComponentAttributes, Metadata, DesignComponentTag, DesignComponent, Attribute } from "@/features/design-components/types"
import { useComponentOperationsContext } from "@/lib/component-operations-context"
import { cn } from "@/lib/utils"
import { ChevronLeftIcon, LoaderIcon, PlugZapIcon, Search } from "lucide-react"
import React, { useCallback } from "react"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select"

const DataSourceSelectorButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) => {
  return (
    <Button variant="outline" size="sm" className="flex flex-col items-center h-auto p-2 gap-1 cursor-pointer" onClick={onClick}>
      <div className="p-1 bg-muted rounded-md">{icon}</div>
      <span className="text-xs text-wrap">{label}</span>
    </Button>
  )
}

function flattenAttributes(attrs: Attribute[]): Attribute[] {
  const out: Attribute[] = []
  for (const a of attrs) {
    if ((a as any).type === "group") {
      out.push(...flattenAttributes((a as any).fields))
    } else if ((a as any).type === "divider") {
      continue
    } else {
      out.push(a)
    }
  }
  return out
}

function findAttributeById(attrs: Attribute[], id: string): Attribute | undefined {
  for (const a of attrs) {
    if ((a as any).type === "group") {
      const found = findAttributeById((a as any).fields, id)
      if (found) return found
    } else if ((a as any).type === "divider") {
      continue
    } else if (a.id === id) {
      return a
    }
  }
  return undefined
}

function useComponentSettingsEditor<Tag extends DesignComponentTag>({ component, setIsOpen }: Omit<SettingsPopoverProps<Tag>, "children"> & { setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const componentInfo = React.useMemo(() => getComponentInfo(component.tag), [component.tag])
  // Keep the hierarchical attributes for rendering (groups/dividers preserved)
  const settingsFields = React.useMemo(() => componentInfo.attributes, [componentInfo.attributes]) as Attribute[]
  const [formData, setFormData] = React.useState<DesignComponentAttributes<Tag>>({} as DesignComponentAttributes<Tag>)

  const { updateComponent } = useComponentOperationsContext()

  React.useEffect(() => {
    const initialFormData = {} as DesignComponentAttributes<Tag>
    const flat = flattenAttributes(componentInfo.attributes) as any as Attribute<any>[]
    for (const field of flat) {
      initialFormData[field.id as keyof DesignComponentAttributes<Tag>] = (field as any).getValue(component) as DesignComponentAttributes<Tag>[typeof field.id]
    }
    setFormData(initialFormData)
  }, [componentInfo.attributes, component])

  const handleSave = () => {
    // Build a copy of formData and fill empty values with setting defaults where available
    const updatedFormData = { ...formData } as DesignComponentAttributes<Tag>

    const flat = flattenAttributes(componentInfo.attributes) as any as Attribute<any>[]
    for (const field of flat) {
      const key = field.id as keyof DesignComponentAttributes<Tag>
      const value = updatedFormData[key]

      if (key === "content" && componentInfo.defaultChildren.length > 0 && String(value).trim() === "") {
        updatedFormData[key] = componentInfo.defaultChildren as any
        continue
      }

      if (typeof value === "string" && String(value).trim() === "") {
        // Prefer the setting's defaultValue (useful for content/defaultChildren), fallback to componentInfo.defaultAttributes
        if (typeof (field as any).defaultValue !== "undefined") {
          updatedFormData[key] = (field as any).defaultValue as any
        } else if (componentInfo.defaultAttributes && typeof (componentInfo.defaultAttributes as any)[key] !== "undefined") {
          updatedFormData[key] = (componentInfo.defaultAttributes as any)[key]
        }
      }
    }

    let update = {} as Partial<DesignComponent<Tag>>
    for (const key in updatedFormData) {
      const reference = findAttributeById(componentInfo.attributes, key) as Attribute | undefined
      if (!reference) continue
      update = (reference as any).setValue(update, (updatedFormData as any)[key])
    }
    updateComponent(component.attributes.id, update)
    setIsOpen(false)
  }

  const handleDiscard = () => {
    // Reset form data to the current component values (including children/content)
    const resetData = {} as DesignComponentAttributes<Tag>
    const flat = flattenAttributes(componentInfo.attributes) as any as Attribute<any>[]
    for (const field of flat) {
      resetData[field.id as keyof DesignComponentAttributes<Tag>] = (field as any).getValue(component) as any
    }
    setFormData(resetData)
    setIsOpen(false)
  }

  const handleFieldChange = (fieldId: keyof DesignComponentAttributes<Tag>, value: string) => {
    setFormData((prev: DataSourceSettings) => ({ ...prev, [fieldId]: value }))
  }


  return {
    componentInfo,
    settingsFields,
    formData,
    setFormData,
    handleDiscard,
    handleFieldChange,
    handleSave
  }
}

function useDataSourceSettingsEditor<Tag extends DesignComponentTag>({ component }: Omit<SettingsPopoverProps<Tag>, "children"> & { setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [searchDataSourceTerm, setSearchDataSourceTerm] = React.useState("")
  const savedDataSourceSettings = decodeDataSourceSettings(component.attributes.__datasource__ || "")
  const dataSourceInfo = savedDataSourceSettings.id ? getDataSourceInfo(savedDataSourceSettings.id) : undefined
  const [selectedDataSource, setSelectedDataSource] = React.useState<DataSourceInfo | undefined>(dataSourceInfo)
  const { updateComponent } = useComponentOperationsContext()

  const filteredDataSources = React.useMemo<DataSourceInfo[]>(() => {
    const dataSources = dataSourceIdList
      .map((connId) => getDataSourceInfo(connId))
      .filter((dataSource): dataSource is DataSourceInfo => !!dataSource)
    if (!searchDataSourceTerm.trim()) return dataSources

    const search = searchDataSourceTerm.toLowerCase()
    return dataSources.filter(
      (conn) =>
        conn.label.toLowerCase().includes(search) ||
        conn.keywords.some((keyword) => keyword.includes(search)),
    )
  }, [searchDataSourceTerm])

  const [formData, setFormData] = React.useState<DataSourceSettings>({ ...savedDataSourceSettings.settings })

  const handleSave = () => {
    if (!selectedDataSource) {
      return
    }
    const updatedFormData: Record<string, string> = { ...formData }
    for (const field of selectedDataSource.settings) {
      if (String(updatedFormData[field.id] || "").trim() === "") {
        updatedFormData[field.id] = field.defaultValue
      }
    }
    const encodedDataSourceSettings = encodeDataSourceSettings({ id: selectedDataSource.id, settings: updatedFormData })
    updateComponent(component.attributes.id, { attributes: { ...component.attributes, __datasource__: encodedDataSourceSettings } })
  }

  const handleDiscard = () => {
    setFormData({} as DataSourceSettings)
    setSelectedDataSource(undefined)
    updateComponent(component.attributes.id, { attributes: { ...component.attributes, __datasource__: "" } })
  }

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  const settingsFields = React.useMemo<ReadonlyArray<DataSourceSettingsField>>(
    () => selectedDataSource?.settings || [],
    [selectedDataSource?.settings])

  return {
    searchDataSourceTerm,
    filteredDataSources,
    selectedDataSource,
    formData,
    settingsFields,
    setSearchDataSourceTerm,
    setSelectedDataSource,
    setFormData,
    handleSave,
    handleDiscard,
    handleFieldChange,
  }
}

function SettingsInputField<Tag extends DesignComponentTag>({ field, formData, handleFieldChange }: {
  field: Attribute<Tag>;
  formData: DesignComponentAttributes<Tag>;
  handleFieldChange: (fieldId: keyof DesignComponentAttributes<Tag>, value: string) => void;
}): React.JSX.Element {
  let CustomInput;

  switch (field.type) {
    case "textarea":
      CustomInput = (
        <textarea
          id={field.id as string}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3",
            "py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          )}
          placeholder={field.placeholder}
          value={(formData[field.id] as string) || ""}
          onChange={(e) => handleFieldChange(field.id, e.target.value)} />
      )
      break;
    case "select":
      CustomInput = (
        <Select
          value={formData[field.id] as string}
          onValueChange={(value) => handleFieldChange(field.id, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={field.placeholder || "Select an option"} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
      break;
    default:
      CustomInput = (
        <Input
          type={field.type}
          id={field.id as string}
          placeholder={field.placeholder}
          readOnly={field.readOnly}
          disabled={field.disabled}
          value={(formData[field.id] as string) || ""}
          onChange={(e) => handleFieldChange(field.id, e.target.value)} />
      )
      break;
  }

  return (
    <div className="space-y-2" key={field.id as string}>
      <Label htmlFor={String(field.id)}>
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
      </Label>
      {CustomInput}
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
    </div>
  )
}

function ComponentSettingsTabContent<Tag extends DesignComponentTag>({ settingsFields, formData, handleDiscard, handleFieldChange, handleSave }: {
  componentInfo: Metadata<Tag>;
  settingsFields: Attribute<Tag>[];
  formData: DesignComponentAttributes<Tag>;
  setFormData: React.Dispatch<DesignComponentAttributes<Tag>>;
  handleDiscard: () => void;
  handleFieldChange: (fieldId: keyof DesignComponentAttributes<Tag>, value: string) => void;
  handleSave: () => void;
}) {
  return (
    <>
      <div className="space-y-4 p-4 overflow-y-scroll flex-1">
        {settingsFields.map((field) => {
          // Divider
          if ((field as any).type === "divider") {
            return <hr key={(field as any).id} className="my-2 border-t" />
          }

          // Group
          if ((field as any).type === "group") {
            const group = field as any

            const GroupRenderer = () => {
              const [collapsed, setCollapsed] = React.useState<boolean>(group.collapsed ?? false)
              return (
                <div key={group.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{group.label}</Label>
                    {group.collapsible && (
                      <Button size="sm" variant="ghost" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? "Expand" : "Collapse"}
                      </Button>
                    )}
                  </div>
                  {!collapsed && (
                    <div className="pl-4 space-y-2">
                      {group.fields.map((nested: Attribute) => {
                        if ((nested as any).type === "divider") {
                          return <hr key={(nested as any).id} className="my-2 border-t" />
                        }
                        if ((nested as any).type === "group") {
                          // Nested groups: render recursively
                          return (
                            <div key={(nested as any).id}>
                              {/* Recursive group rendering simplified */}
                              <Label>{nested.label}</Label>
                              <div className="pl-4">
                                {(nested as any).fields.map((nf: Attribute) => (
                                  <SettingsInputField key={nf.id as string} field={nf} formData={formData} handleFieldChange={handleFieldChange} />
                                ))}
                              </div>
                            </div>
                          )
                        }
                        return <SettingsInputField key={nested.id as string} field={nested} formData={formData} handleFieldChange={handleFieldChange} />
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return <GroupRenderer key={group.id} />
          }

          // Default: render a single field
          return <SettingsInputField key={field.id as string} field={field} formData={formData} handleFieldChange={handleFieldChange} />
        })}
      </div>

      {/* Footer Buttons for Settings Tab */}
      <div className="flex border-t">
        <Button
          variant="ghost"
          className="flex-1 rounded-none rounded-bl-lg bg-muted hover:bg-muted/80 text-foreground h-12 cursor-pointer"
          onClick={handleDiscard}
        >
          Discard
        </Button>
        <Button
          variant="ghost"
          className="flex-1 rounded-none rounded-br-lg bg-foreground hover:bg-foreground/90 text-background h-12 cursor-pointer"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </>
  )
}

type DataSourceSettingsEditorProps = {
  selectedDataSource: DataSourceInfo | undefined
  setSelectedDataSource: React.Dispatch<React.SetStateAction<DataSourceInfo | undefined>>
  filteredDataSources: DataSourceInfo[]
  searchDataSourceTerm: string
  setSearchDataSourceTerm: React.Dispatch<React.SetStateAction<string>>
  settingsFields: ReadonlyArray<DataSourceSettingsField>
  formData: DataSourceSettings
  handleDiscard: () => void
  handleSave: () => void
  handleFieldChange: (fieldId: string, value: string) => void
}

function DataSourceListViewTabContent({
  selectedDataSource,
  setSelectedDataSource,
  filteredDataSources,
  searchDataSourceTerm,
  setSearchDataSourceTerm,
  formData,
  settingsFields,
  handleDiscard,
  handleSave,
  handleFieldChange,
}: DataSourceSettingsEditorProps) {
  return (
    <>
      {!selectedDataSource && <div className="p-4 space-y-4 flex-1 flex flex-col min-h-1 overflow-clip">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search data sources..."
            defaultValue={searchDataSourceTerm}
            onChange={(e) => setSearchDataSourceTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>

        {/* Data Sources Grid */}
        {filteredDataSources.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {filteredDataSources.map((dataSource) => (
              <DataSourceSelectorButton
                key={dataSource.id}
                icon={dataSource.Icon}
                label={dataSource.label}
                onClick={() => setSelectedDataSource(dataSource)}
              />
            ))}
          </div>
        ) : (
          <div className="col-span-3 text-center py-4 text-muted-foreground text-sm">No components found</div>
        )}
      </div>}

      {selectedDataSource && <DataSourceSettingsView
        selectedDataSource={selectedDataSource}
        setSelectedDataSource={setSelectedDataSource}
        formData={formData}
        settingsFields={settingsFields}
        handleDiscard={handleDiscard}
        handleFieldChange={handleFieldChange}
        handleSave={handleSave}
        filteredDataSources={filteredDataSources}
        searchDataSourceTerm={searchDataSourceTerm}
        setSearchDataSourceTerm={setSearchDataSourceTerm}
      />}
    </>
  )
}

function DataSourceSettingsView(props: DataSourceSettingsEditorProps) {
  const { selectedDataSource, setSelectedDataSource, handleSave, handleDiscard, handleFieldChange, settingsFields, formData } = props
  if (!selectedDataSource) {
    throw new Error(`Could not find data source`)
  }
  const [connectionResult, setConnectionResult] = React.useState<string>("")
  const [testingConnection, setTestingConnection] = React.useState(false)

  const testConnection = async (formData: DataSourceSettings) => {
    try {
      setTestingConnection(true)
      const result = await selectedDataSource.tryConnection(formData)
      setConnectionResult(JSON.stringify(result, null, 2))
    } catch (error) {
      setConnectionResult(JSON.stringify(error, null, 2))
    } finally {
      setTestingConnection(false)
    }
  }

  const discardConnection = useCallback(() => {
    handleDiscard()
  }, [handleDiscard])

  return (
    <>
      <div className="flex bg-background border-b align-middle">
        <Button className="rounded-none bg-accent border-r text-foreground hover:bg-accent cursor-pointer"
          onClick={() => setSelectedDataSource(undefined)}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <span className="pl-4 flex items-center text-muted-foreground text-sm">{selectedDataSource?.label} Settings</span>
      </div>

      <div className="p-4 space-y-4 flex-1 flex flex-col min-h-1 overflow-y-scroll">
        {settingsFields.map((field) => (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={field.id}>{field.label}</Label>
            {field.type === "textarea" ? (
              <textarea
                id={field.id}
                className={cn(
                  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3",
                  "py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                )}
                placeholder={field.placeholder}
                value={formData[field.id] || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
              />
            ) : (
              <Input
                type={field.type}
                id={field.id}
                placeholder={field.placeholder}
                value={formData[field.id] || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
              />
            )}
          </div>
        ))}

        <div className="space-y-2">
          <Button className="cursor-pointer w-full"
            disabled={testingConnection}
            onClick={() => testConnection(formData)}
          >
            {testingConnection ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <PlugZapIcon className="h-4 w-4" />} &nbsp;
            {testingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>

        {connectionResult && <div className="space-y-2">
          <Label htmlFor="example-results">Example Results</Label>
          <pre
            id="example-results"
            className={cn(
              "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3",
              "py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              "overflow-scroll"
            )}
          >
            {connectionResult || ""}
          </pre>
        </div>}
      </div>

      {/* Footer Buttons for Settings Tab */}
      <div className="flex border-t -mx-4">
        <Button
          variant="ghost"
          className="flex-1 rounded-none rounded-bl-lg bg-muted hover:bg-muted/80 text-foreground h-12 cursor-pointer"
          onClick={discardConnection}
        >
          Disconnect
        </Button>
        <Button
          variant="ghost"
          className="flex-1 rounded-none rounded-br-lg bg-foreground hover:bg-foreground/90 text-background h-12 cursor-pointer"
          onClick={handleSave}
        >
          Connect
        </Button>
      </div>
    </>
  )
}

export interface SettingsPopoverProps<Tag extends DesignComponentTag> {
  component: DesignComponent<Tag>
  children: React.ReactNode
}

export const SettingsPopover: React.FC<SettingsPopoverProps<DesignComponentTag>> = <Tag extends DesignComponentTag>({
  component,
  children,
}: SettingsPopoverProps<Tag>) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const componentSettingsEditor = useComponentSettingsEditor({ component, setIsOpen })
  const dataSourceSettingsEditor = useDataSourceSettingsEditor({ component, setIsOpen })

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0 z-50" side="bottom" align="end" sideOffset={8}>
        <div className="bg-background border rounded-lg shadow-lg -m-1 h-[550px] max-h-[600px] overflow-clip flex flex-col">
          {/* Header */}
          <div className="bg-foreground text-background p-3 rounded-t-lg">
            <h2 className="text-sm font-semibold">{componentSettingsEditor.componentInfo.label}</h2>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="settings" className="w-full flex flex-col flex-1 min-h-1">
            <TabsList className="grid w-full grid-cols-2 rounded-none bg-transparent border-b h-auto p-0">
              <TabsTrigger
                data-testid="settings-tab-trigger"
                value="settings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-muted cursor-pointer"
              >
                Settings
              </TabsTrigger>
              <TabsTrigger
                data-testid="data-sources-tab-trigger"
                value="data-sources"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-muted cursor-pointer"
              >
                Data Sources
              </TabsTrigger>
            </TabsList>

            {/* Settings Tab Content */}
            <TabsContent value="settings" className="mt-0 flex-1 flex flex-col min-h-1 overflow-clip">
              <ComponentSettingsTabContent
                {...componentSettingsEditor}
              />
            </TabsContent>

            {/* Data Sources Tab Content */}
            <TabsContent value="data-sources" className="mt-0 flex-1 flex flex-col min-h-1 overflow-clip">
              <DataSourceListViewTabContent {...dataSourceSettingsEditor} />
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  )
}
