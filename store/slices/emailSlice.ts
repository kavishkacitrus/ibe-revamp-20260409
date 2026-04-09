import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface EmailRequest {
  toEmail: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  ccEmails?: string;
  bccEmails?: string;
  replyToEmail?: string;
  priority?: number;
  senderName?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  emailId?: string;
  sentAt?: string;
  toEmail?: string;
  subject?: string;
  errorDetails?: string;
}

export interface EmailState {
  isLoading: boolean;
  error: string | null;
  lastEmailResponse: EmailResponse | null;
  emailHistory: EmailResponse[];
}

// Initial state
const initialState: EmailState = {
  isLoading: false,
  error: null,
  lastEmailResponse: null,
  emailHistory: [],
};

// Async thunks
export const sendEmail = createAsyncThunk<
  EmailResponse,
  EmailRequest,
  { rejectValue: string }
>(
  'email/sendEmail',
  async (emailData, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`${apiUrl}api/email/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to send email');
      }

      const data: EmailResponse = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send email');
    }
  }
);

// Slice
const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    clearEmailError: (state) => {
      state.error = null;
    },
    clearLastEmailResponse: (state) => {
      state.lastEmailResponse = null;
    },
    clearEmailHistory: (state) => {
      state.emailHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Send email
      .addCase(sendEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendEmail.fulfilled, (state, action: PayloadAction<EmailResponse>) => {
        state.isLoading = false;
        state.lastEmailResponse = action.payload;
        state.emailHistory.unshift(action.payload);
        // Keep only last 10 emails in history
        if (state.emailHistory.length > 10) {
          state.emailHistory = state.emailHistory.slice(0, 10);
        }
      })
      .addCase(sendEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to send email';
      });
  },
});

// Actions
export const { clearEmailError, clearLastEmailResponse, clearEmailHistory } = emailSlice.actions;

// Selectors
export const selectEmailState = (state: { email: EmailState }) => state.email;
export const selectEmailLoading = (state: { email: EmailState }) => state.email.isLoading;
export const selectEmailError = (state: { email: EmailState }) => state.email.error;
export const selectLastEmailResponse = (state: { email: EmailState }) => state.email.lastEmailResponse;
export const selectEmailHistory = (state: { email: EmailState }) => state.email.emailHistory;

// Reducer
export default emailSlice.reducer;
